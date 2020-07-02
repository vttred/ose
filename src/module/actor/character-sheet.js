import { OseActor } from "./entity.js";
import { OseActorSheet } from "./actor-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class OseActorSheetCharacter extends OseActorSheet {
  constructor(...args) {
    super(...args);
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ose", "sheet", "actor", "character"],
      template: "systems/ose/templates/actors/character-sheet.html",
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
   * Prepare data for rendering the Actor sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    const data = super.getData();

    for (let [a, score] of Object.entries(data.data.scores)) {
      data.data.scores[a].label = game.i18n.localize(`OSE.scores.${a}`);
    }

    // Settings
    data.config.variableWeaponDamage = game.settings.get(
      "ose",
      "variableWeaponDamage"
    );
    data.config.ascendingAC = game.settings.get("ose", "ascendingAC");
    data.config.individualInit = game.settings.get("ose", "individualInit");

    data.mods = this.actor.computeModifiers();
    return data;
  }

  /* -------------------------------------------- */

  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item"),
      item = this.actor.getOwnedItem(li.data("item-id")),
      description = TextEditor.enrichHTML(item.data.data.description);
    // Toggle summary
    if (li.hasClass("expanded")) {
      let summary = li.parents(".item-entry").children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    } else {
      let div = $(`<div class="item-summary">${description}</div>`);
      li.parents(".item-entry").append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }

  async _onQtChange(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);
    return item.update({ "data.quantity.value": parseInt(event.target.value) });
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    html.find(".item-create").click((event) => {
      event.preventDefault();
      const header = event.currentTarget;
      const type = header.dataset.type;
      const itemData = {
        name: `New ${type.capitalize()}`,
        type: type,
        data: duplicate(header.dataset),
      };
      delete itemData.data["type"];
      return this.actor.createOwnedItem(itemData);
    });

    //Toggle Equipment
    html.find(".item-toggle").click(async (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      await this.actor.updateOwnedItem({
        _id: li.data("itemId"),
        data: {
          equipped: !item.data.data.equipped,
        },
      });
    });

    html
      .find(".quantity input")
      .click((ev) => ev.target.select())
      .change(this._onQtChange.bind(this));

    // Item summaries
    html
      .find(".item .item-name h4")
      .click((event) => this._onItemSummary(event));

    html.find(".ability-score .attribute-name a").click((ev) => {
      let actorObject = this.actor;
      let element = event.currentTarget;
      let score = element.parentElement.parentElement.dataset.score;
      actorObject.rollCheck(score, { event: event });
    });

    // Handle default listeners last so system listeners are triggered first
    super.activateListeners(html);
  }
}
