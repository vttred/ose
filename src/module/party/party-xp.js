import { OSE } from "../config";
import { OseParty } from "./party";

export class OsePartyXP extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ose", "dialog", "party-xp"],
      template: `${OSE.systemPath()}/templates/apps/party-xp.html`,
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
  get title() {
    return game.i18n.localize("OSE.dialog.xp.deal");
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
      settings,
    };
  }

  _onDrop(event) {
    event.preventDefault();
    // WIP Drop Item Quantity
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (data.type !== "Item") return;
    } catch (error) {
      return false;
    }
  }
  /* -------------------------------------------- */

  _updateObject(event, formData) {
    this._dealXP(event);
  }

  _calculateShare(ev) {
    const { currentParty } = OseParty;

    const html = $(this.form);
    const totalXP = html.find('input[name="total"]').val();
    const baseXpShare = parseFloat(totalXP) / currentParty.length;

    currentParty.forEach((a) => {
      const actorData = a?.system;
      const xpShare = Math.floor(
        (actorData.details.xp.share / 100) * baseXpShare
      );
      html.find(`li[data-actor-id='${a.id}'] input`).val(xpShare);
    });
  }

  _dealXP(ev) {
    const html = $(this.form);
    const rows = html.find(".actor");
    rows.each((_, row) => {
      const qRow = $(row);
      const value = qRow.find("input").val();
      const id = qRow.data("actorId");
      const actor = OseParty.currentParty.find((e) => e.id === id);
      if (value) {
        actor.getExperience(Math.floor(parseInt(value)));
      }
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    const totalField = html.find('input[name="total"]');
    totalField.on("input", this._calculateShare.bind(this));

    html.find('button[data-action="deal-xp"').click((event) => {
      super.submit(event);
    });
  }
}
