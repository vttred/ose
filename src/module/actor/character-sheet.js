import { OseActor } from "./entity.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class OseActorSheetCharacter extends ActorSheet {
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

  /* -------------------------------------------- */

  /**
   * Prepare data for rendering the Actor sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    const data = super.getData();
    
    data.config = CONFIG.OSE;

    for (let [a, score] of Object.entries(data.data.scores)) {
      data.data.scores[a].label = game.i18n.localize(`OSE.scores.${a}`);
    }
    // Prepare owned items
    this._prepareItems(data);

    // DEBUG
    return data;
  }

  /**
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  _prepareItems(data) {
    // Partition items by category
    let [inventory, abilities, spells] = data.items.reduce(
      (arr, item) => {
        // Classify items into types
        if (item.type === "item") arr[0].push(item);
        if (item.type === "ability") arr[1].push(item);
        else if (item.type === "spell") arr[2].push(item);
        return arr;
      },
      [[], [], [], []]
    );

    // Assign and return
    data.inventory = inventory;
    data.spells = spells;
    data.abilities = abilities;
  }

  /* -------------------------------------------- */

  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item"),
        item = this.actor.getOwnedItem(li.data("item-id")),
        description = TextEditor.enrichHTML(item.data.data.description);
    // Toggle summary
    if ( li.hasClass("expanded") ) {
      let summary = li.parents('.item-entry').children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    } else {
      let div = $(`<div class="item-summary">${description}</div>`);
      li.parents('.item-entry').append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }

  _onRollAttribute(event) {
    event.preventDefault();
    let attribute = event.currentTarget.dataset.attribute;
    this.actor.rollAttribute(attribute, { event: event });
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

    // Item summaries
    html.find('.item .item-name h4').click(event => this._onItemSummary(event));

    // Handle default listeners last so system listeners are triggered first
    super.activateListeners(html);
  }
}
