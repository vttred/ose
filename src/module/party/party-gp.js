/**
 * @file An application for dispensing XP to party members
 */
import OSE from "../config";
import OseParty from "./party";

export default class OsePartyGP extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ose", "dialog", "party-gp"],
      template: `${OSE.systemPath()}/templates/apps/party-gp.html`,
      width: 300,
      height: "auto",
      resizable: false,
      closeOnSubmit: true,
    });
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   *
   * @type {string}
   */
  // eslint-disable-next-line class-methods-use-this
  get title() {
    return game.i18n.localize("OSE.dialog.gp.deal");
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   *
   * @returns {object}
   */
  getData() {
    return {
      actors: OseParty.currentParty,
      data: this.object,
      config: CONFIG.OSE,
      user: game.user,
      settings: game.settings,
    };
  }

  // eslint-disable-next-line no-underscore-dangle
  _updateObject(event) {
    // eslint-disable-next-line no-underscore-dangle
    this._dealGP(event);
  }

  // eslint-disable-next-line no-underscore-dangle
  _calculateShare() {
    const { currentParty } = OseParty;

    const html = $(this.form);
    const totalGP = html.find('input[name="total"]').val();
    const baseGPShare = parseFloat(totalGP) / currentParty.length;

    currentParty.forEach((a) => {
      html.find(`li[data-actor-id='${a.id}'] input`).val(baseGPShare);
    });
  }

  // eslint-disable-next-line no-underscore-dangle
  _dealGP() {
    const html = $(this.form);
    const rows = html.find(".actor");
    rows.each((_, row) => {
      const qRow = $(row);
      // get value from input and cast to integer
      const value = parseInt(qRow.find("input").val(), 10);
      const id = qRow.data("actorId");
      const actor = OseParty.currentParty.find((e) => e.id === id);
      if (value) {
        // check if the actor already has the gold item
        const item = actor.items.find((e) => e.name === "GP");
        if (item) {
          // update the quantity using update method
          item.update({
            "system.quantity.value": item.system.quantity.value + value,
          });
          return;
        }

        // create a new GP item
        const itemData = {
          name: game.i18n.localize("OSE.items.gp.short"),
          type: "item",
          img: `${OSE.assetsPath}/gold.png`,
          system: {
            treasure: true,
            cost: 1,
            weight: 1,
            quantity: {
              value,
            },
          },
        };
        actor.createEmbeddedDocuments("Item", [itemData]);
      }
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    const totalField = html.find('input[name="total"]');
    // eslint-disable-next-line no-underscore-dangle
    totalField.on("input", this._calculateShare.bind(this));

    html.find('button[data-action="deal-gp"').click((event) => {
      super.submit(event);
    });
  }
}
