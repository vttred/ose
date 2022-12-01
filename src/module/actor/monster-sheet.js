import { OseActorSheet } from "./actor-sheet";
import { OSE } from "../config";

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class OseActorSheetMonster extends OseActorSheet {
  constructor(...args) {
    super(...args);
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ose", "sheet", "monster", "actor"],
      template: `${OSE.systemPath()}/templates/actors/monster-sheet.html`,
      width: 450,
      height: 560,
      resizable: true,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".sheet-body",
          initial: "attributes",
        },
      ],
    });
  }

  /**
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  _prepareItems(data) {
    const itemsData = this.actor?.items;
    const containerContents = {};
    const attackPatterns = {};

    let colors = Object.keys(CONFIG.OSE.colors);
    colors.push("transparent");

    // Set up attack patterns in specific order
    for (var i = 0; i < colors.length; i++) {
      attackPatterns[colors[i]] = [];
    }

    // Partition items by category
    let [weapons, items, armors, spells, containers, treasures] =
      itemsData.reduce(
        (arr, item) => {
          const itemData = item?.system;
          // Classify items into types
          const containerId = itemData.containerId;
          if (containerId) {
            containerContents[containerId] = [
              ...(containerContents[containerId] || []),
              item,
            ];
            return arr;
          }
          // Add Items to their respective attack groups
          if (["weapon", "ability"].includes(item.type)) {
            attackPatterns[item.system.pattern].push(item);
          }
          // Classify items into types
          switch (item.type) {
            case "weapon":
              arr[0].push(item);
              break;
            case "item":
              arr[item.system.treasure ? 5 : 1].push(item);
              break;
            case "armor":
              arr[2].push(item);
              break;
            case "spell":
              arr[3].push(item);
              break;
            case "container":
              arr[4].push(item);
              break;
          }

          return arr;
        },
        [[], [], [], [], [], []]
      );

    // Sort spells by level
    var sortedSpells = {};
    var slots = {};
    for (var i = 0; i < spells.length; i++) {
      let lvl = spells[i].system.lvl;
      if (!sortedSpells[lvl]) sortedSpells[lvl] = [];
      if (!slots[lvl]) slots[lvl] = 0;
      slots[lvl] += spells[i].system.memorized;
      sortedSpells[lvl].push(spells[i]);
    }
    data.slots = {
      used: slots,
    };
    containers.map((container, key, arr) => {
      arr[key].system.itemIds = containerContents[container.id] || [];
      arr[key].system.totalWeight = containerContents[container.id]?.reduce(
        (acc, item) => {
          return (
            acc + item.system?.weight * (item.system?.quantity?.value || 1)
          );
        },
        0
      );
      return arr;
    });
    // Assign and return
    data.owned = { weapons, items, containers, armors, treasures };

    data.attackPatterns = attackPatterns;
    // Sort items and spells alphabetically within their groups
    data.spells = sortedSpells;
    [...Object.values(data.owned), ...Object.values(data.spells)].forEach((o) =>
      o.sort((a, b) => a.name.localeCompare(b.name))
    );

    // Within each attack pattern, weapons come before abilities,
    // and are then alphabetized
    Object.values(data.attackPatterns).forEach((o) =>
      o.sort(
        (a, b) =>
          b.type.localeCompare(a.type) ||
          a.name.localeCompare(b.name)
      )
    );
  }

  /**
   * Prepare data for rendering the Actor sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  async getData() {
    const data = super.getData();
    // Prepare owned items
    this._prepareItems(data);

    const monsterData = data?.system;

    // Settings
    data.config.morale = game.settings.get(game.system.id, "morale");
    monsterData.details.treasure.link = await TextEditor.enrichHTML(
      monsterData.details.treasure.table,
      { async: true }
    );
    data.isNew = this.actor.isNew();

    if (isNewerVersion(game.version, "10.264")) {
      data.enrichedBiography = await TextEditor.enrichHTML(
        this.object.system.details.biography,
        { async: true }
      );
    }
    return data;
  }

  /**
   * Monster creation helpers
   */
  async generateSave() {
    let choices = CONFIG.OSE.monster_saves;

    let templateData = { choices: choices },
      dlg = await renderTemplate(
        `${OSE.systemPath()}/templates/actors/dialogs/monster-saves.html`,
        templateData
      );
    //Create Dialog window
    new Dialog(
      {
        title: game.i18n.localize("OSE.dialog.generateSaves"),
        content: dlg,
        buttons: {
          ok: {
            label: game.i18n.localize("OSE.Ok"),
            icon: '<i class="fas fa-check"></i>',
            callback: (html) => {
              let hd = html.find('input[name="hd"]').val();
              this.actor.generateSave(hd);
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("OSE.Cancel"),
          },
        },
        default: "ok",
      },
      {
        width: 250,
      }
    ).render(true);
  }

  async _onDrop(event) {
    super._onDrop(event);
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (data.type !== "RollTable") return;
    } catch (err) {
      return false;
    }

    let link = "";
    if (data.pack) {
      let tableData = game.packs
        .get(data.pack)
        .index.filter((el) => el._id === data.id);
      link = `@UUID[${data.uuid}]{${tableData[0].name}}`;
    } else {
      link = `@UUID[${data.uuid}]`;
    }
    this.actor.update({ 'system.details.treasure.table': link });
  }

  /* -------------------------------------------- */
  async _resetAttacks(event) {
    return Promise.all(
      this.actor.items
        .filter(i => i.type === 'weapon')
        .map(weapon => weapon.update({
          'system.counter.value': parseInt(weapon.system.counter.max)
        }))
    )
  }

  async _updateAttackCounter(event) {
    event.preventDefault();
    const item = this._getItemFromActor(event);

    if (event.target.dataset.field === "value") {
      return item.update({
        "system.counter.value": parseInt(event.target.value),
      });
    } else if (event.target.dataset.field === "max") {
      return item.update({
        "system.counter.max": parseInt(event.target.value),
      });
    }
  }

  _cycleAttackPatterns(event) {
    const item = super._getItemFromActor(event);
    let currentColor = item.system.pattern;
    // Attack patterns include all OSE colors and transparent
    let colors = Object.keys(CONFIG.OSE.colors);
    colors.push("transparent");
    let index = colors.indexOf(currentColor);
    if (index + 1 == colors.length) {
      index = 0;
    } else {
      index++;
    }
    item.update({
      "system.pattern": colors[index],
    });
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".morale-check a").click((ev) => {
      let actorObject = this.actor;
      actorObject.rollMorale({ event: ev });
    });

    html.find(".reaction-check a").click((ev) => {
      let actorObject = this.actor;
      actorObject.rollReaction({ event: ev });
    });

    html.find(".appearing-check a").click((ev) => {
      let actorObject = this.actor;
      let check = $(ev.currentTarget).closest(".check-field").data("check");
      actorObject.rollAppearing({ event: ev, check: check });
    });

    html.find(".treasure-table a").contextmenu((ev) => {
      this.actor.update({ 'system.details.treasure.table': null });
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find(".item-reset[data-action='reset-attacks']").click((ev) => {
      this._resetAttacks(ev);
    });

    html
      .find(".counter input")
      .click((ev) => ev.target.select())
      .change(this._updateAttackCounter.bind(this));

    html.find(".hp-roll").click((ev) => {
      this.actor.rollHP({ event: ev });
    });

    html.find(".item-pattern").click((ev) => this._cycleAttackPatterns(ev));

    html
      .find('button[data-action="generate-saves"]')
      .click(() => this.generateSave());
  }
}
