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
      height: 530,
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

    // Settings
    data.config.variableWeaponDamage = game.settings.get(
      "ose",
      "variableWeaponDamage"
    );
    data.config.ascendingAC = game.settings.get("ose", "ascendingAC");
    data.config.individualInit = game.settings.get("ose", "individualInit");

    // Compute treasure
    let total = 0;
    data.owned.items.forEach(item => {
      if (item.data.treasure) {
        total += item.data.quantity.value * item.data.cost;
      } 
    });
    data.treasure = total;

    let basic = game.settings.get('ose', 'encumbranceOption') == 'basic';
    // Compute encumbrance
    let totalWeight = 0;
    Object.values(data.owned).forEach(cat => {
      cat.forEach(item => {
        if (item.type == 'item' && (!basic || item.data.treasure)) {
          totalWeight += item.data.quantity.value * item.data.weight;
        }
        else if (!basic) {
          totalWeight += item.data.weight;
        }
      })
    });
    data.encumbrance = {
      pct: Math.clamped(100 * parseFloat(totalWeight) / data.data.encumbrance.max, 0, 100),
      max: data.data.encumbrance.max,
      encumbered: totalWeight > data.data.encumbrance.max,
      value: totalWeight
    };
    return data;
  }

  /* -------------------------------------------- */

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

    html.find(".ability-score .attribute-name a").click((ev) => {
      let actorObject = this.actor;
      let element = event.currentTarget;
      let score = element.parentElement.parentElement.dataset.score;
      actorObject.rollCheck(score, { event: event });
    });

    html.find(".exploration .attribute-name a").click((ev) => {
      let actorObject = this.actor;
      let element = event.currentTarget;
      let expl = element.parentElement.parentElement.dataset.exploration;
      actorObject.rollExploration(expl, { event: event });
    });

    html.find(".ability-score .attribute-mod a").click(ev => {
      let box = $(event.currentTarget.parentElement.parentElement.parentElement);
      box.children('.attribute-bonuses').slideDown(200);
    })

    html.find(".ability-score .attribute-bonuses a").click(ev => {
      $(event.currentTarget.parentElement.parentElement).slideUp(200);
    })

    html.find(".inventory .item-titles").click(ev => {
      let items = $(event.currentTarget.parentElement).children('.item-list');
      if (items.css('display') == "none") {
        items.slideDown(200);
      } else {
        items.slideUp(200);
      }
    })

    // Handle default listeners last so system listeners are triggered first
    super.activateListeners(html);
  }
}
