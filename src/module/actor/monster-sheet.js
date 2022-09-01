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
    const itemsData = this.actor?.items || this.actor?.data?.items; //v9-compatibility
    const containerContents = {};
    const attackPatterns = {};

    // Partition items by category
    let [weapons, items, armors, spells, containers] = itemsData.reduce(
      (arr, item) => {
        const itemData = item?.system || item?.data?.data; //v9-compatibility
        // Classify items into types
        const containerId = itemData.containerId;
        if (containerId) {
          containerContents[containerId] = [
            ...(containerContents[containerId] || []),
            item,
          ];
          return arr;
        }
        // Grab attack groups
        if (["weapon", "ability"].includes(item.type)) {
          if (attackPatterns[item.data.data.pattern] === undefined)
            attackPatterns[item.data.data.pattern] = [];
          attackPatterns[item.data.data.pattern].push(item);
        }
        // Classify items into types
        switch (item.type) {
          case "weapon":
            arr[0].push(item);
            break;
          case "item":
            arr[1].push(item);
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
      [[], [], [], [], []]
    );

    // Sort spells by level
    var sortedSpells = {};
    var slots = {};
    for (var i = 0; i < spells.length; i++) {
      let lvl = spells[i].data.data.lvl;
      if (!sortedSpells[lvl]) sortedSpells[lvl] = [];
      if (!slots[lvl]) slots[lvl] = 0;
      slots[lvl] += spells[i].data.data.memorized;
      sortedSpells[lvl].push(spells[i]);
    }
    data.slots = {
      used: slots,
    };
    containers.map((container, key, arr) => {
      arr[key].data.data.itemIds = containerContents[container.id] || [];
      arr[key].data.data.totalWeight = containerContents[container.id]?.reduce(
        (acc, item) => {
          return (
            acc +
            item.data?.data?.weight * (item.data?.data?.quantity?.value || 1)
          );
        },
        0
      );
      return arr;
    });
    // Assign and return
    data.owned = {
      weapons: weapons,
      items: items,
      containers: containers,
      armors: armors,
    };
    data.attackPatterns = attackPatterns;
    data.spells = sortedSpells;
    [
      ...Object.values(data.attackPatterns),
      ...Object.values(data.owned),
      ...Object.values(data.spells),
    ].forEach((o) => o.sort((a, b) => (a.data.sort || 0) - (b.data.sort || 0)));
  }

  /**
   * Prepare data for rendering the Actor sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  async getData() {
    const data = super.getData();
    // Prepare owned items
    this._prepareItems(data);

    const monsterData = data?.system || data?.data; //v9-compatibility

    // Settings
    data.config.morale = game.settings.get(game.system.id, "morale");
    monsterData.details.treasure.link = TextEditor.enrichHTML(
      monsterData.details.treasure.table
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
      link = `@Compendium[${data.pack}.${data.id}]{${tableData[0].name}}`;
    } else {
      link = `@RollTable[${data.id}]`;
    }
    const treasureTableKey = isNewerVersion(game.version, "10.264")
      ? "system.details.treasure.table"
      : "data.details.treasure.table"; //v9-compatibility
    this.actor.update({ [treasureTableKey]: link });
  }

  /* -------------------------------------------- */
  async _resetAttacks(event) {
    const monsterItems = this.actor?.items || this.actor?.data?.items; //v9-compatiblity
    const weapons = monsterItems.filter((i) => i.type === "weapon");
    for (let wp of weapons) {
      const item = this.actor.items.get(wp.id);
      await item.update({
        data: {
          counter: {
            value: parseInt(wp.data.data.counter.max),
          },
        },
      });
    }
  }

  async _updateAttackCounter(event) {
    event.preventDefault();
    const item = this._getItemFromActor(event);

    if (event.target.dataset.field === "value") {
      return item.update({
        "data.counter.value": parseInt(event.target.value),
      });
    } else if (event.target.dataset.field === "max") {
      return item.update({
        "data.counter.max": parseInt(event.target.value),
      });
    }
  }

  _cycleAttackPatterns(event) {
    const item = super._getItemFromActor(event);
    let currentColor = item.data.data.pattern;
    let colors = Object.keys(CONFIG.OSE.colors);
    let index = colors.indexOf(currentColor);
    if (index + 1 == colors.length) {
      index = 0;
    } else {
      index++;
    }
    item.update({
      "data.pattern": colors[index],
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
