// eslint-disable-next-line no-unused-vars

import { OSE } from "../config";

export class OseCharacterGpCost extends FormApplication {
  constructor(event, preparedData, position) {
    super(event, position);
    this.object.preparedData = preparedData;
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    (options.classes = ["ose", "dialog", "gp-cost"]),
      (options.id = "sheet-gp-cost");
    options.template = `${OSE.systemPath()}/templates/actors/dialogs/gp-cost-dialog.html`;
    options.width = 240;
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   * @type {String}
   */
  get title() {
    return `${this.object.name}: ${game.i18n.localize(
      "OSE.dialog.shoppingCart"
    )}`;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  async getData() {
    const data = await foundry.utils.deepClone(this.object.preparedData);
    data.totalCost = await this._getTotalCost(data);
    data.user = game.user;
    this.inventory = this.object.items;
    return data;
  }

  async close(options) {
    return super.close(options);
  }

  async _onSubmit(event, { preventClose = false, preventRender = false } = {}) {
    super._onSubmit(event, {
      preventClose: preventClose,
      preventRender: preventRender,
    });
    // Generate gold
    const totalCost = await this._getTotalCost(await this.getData());
    const gp = await this.object.items.find((item) => {
      itemData = item.system;
      return (
        (item.name === game.i18n.localize("OSE.items.gp.short") ||
          item.name === "GP") && // legacy behavior used GP, even for other languages
        itemData.treasure
      );
    });
    if (!gp) {
      ui.notifications.error(game.i18n.localize("OSE.error.noGP"));
    }
    const newGP = gp.system.quantity.value - totalCost;
    if (newGP >= 0) {
      this.object.updateEmbeddedDocuments("Item", [
        { _id: gp.id, "system.quantity.value": newGP },
      ]);
    } else {
      ui.notifications.error(game.i18n.localize("OSE.error.notEnoughGP"));
    }
  }

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  async _updateObject(event, formData) {
    event.preventDefault();
    const items = this.object.data.items;

    const speaker = ChatMessage.getSpeaker({ actor: this });
    const templateData = await this.getData();
    const content = await renderTemplate(
      `${OSE.systemPath()}/templates/chat/inventory-list.html`,
      templateData
    );
    ChatMessage.create({
      content: content,
      speaker: speaker,
    });
    // Update the actor
    await this.object.update(formData);

    // Re-draw the updated sheet
    this.object.sheet.render(true);
  }

  async _getTotalCost(data) {
    let total = 0;
    const physical = ["item", "container", "weapon", "armor"];
    data.items.forEach((item) => {
      const itemData = item.system;
      if (
        physical.some((itemType) => item.type === itemType) &&
        !itemData.treasure
      )
        if (itemData.quantity.max) total += itemData.cost;
        else total += itemData.cost * itemData.quantity.value;
    });
    return total;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find("a.auto-deduct").click(async (ev) => {
      this.submit();
    });
  }
}
