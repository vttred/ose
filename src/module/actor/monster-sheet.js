import { OSE } from "../config";
import { OseActorSheet } from "./actor-sheet";

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
   *
   * @returns {object}
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
   *
   * @param data
   * @private
   */
  _prepareItems(data) {
    // Assign and return
    data.owned = {
      weapons: this.actor.system.weapons,
      items: this.actor.system.items,
      containers: this.actor.system.containers,
      armors: this.actor.system.armor,
      treasures: this.actor.system.treasures,
    };

    data.attackPatterns = this.actor.system.attackPatterns;
    data.spells = this.actor.system.spells.spellList;
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
    const choices = CONFIG.OSE.monster_saves;

    const templateData = { choices };
    const dlg = await renderTemplate(
      `${OSE.systemPath()}/templates/actors/dialogs/monster-saves.html`,
      templateData
    );
    // Create Dialog window
    new Dialog(
      {
        title: game.i18n.localize("OSE.dialog.generateSaves"),
        content: dlg,
        buttons: {
          ok: {
            label: game.i18n.localize("OSE.Ok"),
            icon: '<i class="fas fa-check"></i>',
            callback: (html) => {
              const hd = html.find('input[name="hd"]').val();
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
    } catch (error) {
      return false;
    }

    let link = "";
    if (data.pack) {
      const tableDatum = game.packs
        .get(data.pack)
        .index.find((el) => el._id === data.id);
      link = `@UUID[${data.uuid}]{${tableDatum.name}}`;
    } else {
      link = `@UUID[${data.uuid}]`;
    }
    this.actor.update({ "system.details.treasure.table": link });
  }

  /* -------------------------------------------- */
  async _resetAttacks(event) {
    return Promise.all(
      this.actor.items
        .filter((i) => i.type === "weapon")
        .map((weapon) =>
          weapon.update({
            "system.counter.value": parseInt(weapon.system.counter.max),
          })
        )
    );
  }

  async _updateAttackCounter(event) {
    event.preventDefault();
    const item = this._getItemFromActor(event);

    if (event.target.dataset.field === "value") {
      return item.update({
        "system.counter.value": parseInt(event.target.value),
      });
    }
    if (event.target.dataset.field === "max") {
      return item.update({
        "system.counter.max": parseInt(event.target.value),
      });
    }
  }

  _cycleAttackPatterns(event) {
    const item = super._getItemFromActor(event);
    const currentColor = item.system.pattern;
    // Attack patterns include all OSE colors and transparent
    const colors = Object.keys(CONFIG.OSE.colors);
    colors.push("transparent");
    let index = colors.indexOf(currentColor);
    if (index + 1 === colors.length) {
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
   *
   * @param html - {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".morale-check a").click((ev) => {
      const actorObject = this.actor;
      actorObject.rollMorale({ event: ev });
    });

    html.find(".reaction-check a").click((ev) => {
      const actorObject = this.actor;
      actorObject.rollReaction({ event: ev });
    });

    html.find(".appearing-check a").click((ev) => {
      const actorObject = this.actor;
      const check = $(ev.currentTarget).closest(".check-field").data("check");
      actorObject.rollAppearing({ event: ev, check });
    });

    html.find(".treasure-table a").contextmenu((ev) => {
      this.actor.update({ "system.details.treasure.table": null });
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
