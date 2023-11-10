/**
 * @file An application for deducting currency from an actor using the Shopping Cart feature
 */
// eslint-disable-next-line no-unused-vars
import OSE from "../config";

export default class OseCharacterGpCost extends FormApplication {
  constructor(event, preparedData, position) {
    super(event, position);
    this.object.preparedData = preparedData;
  }

  static PhysicalItemTypes = new Set(["item", "container", "weapon", "armor"]);

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes = ["ose", "dialog", "gp-cost"];
    options.id = "sheet-gp-cost";
    options.template = `${OSE.systemPath()}/templates/actors/dialogs/gp-cost-dialog.html`;
    options.width = 240;
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   *
   * @type {string}
   * @returns {string} - A localized window title
   */
  get title() {
    return `${this.object.name}: ${game.i18n.localize(
      "OSE.dialog.shoppingCart"
    )}`;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   *
   * @returns {object} - The template data
   */
  async getData() {
    const data = await foundry.utils.deepClone(this.object.preparedData);
    data.totalCost = await this.#getTotalCost(data);
    data.user = game.user;
    this.inventory = this.object.items;
    return data;
  }

  async close(options) {
    return super.close(options);
  }

  /**
   * An object that provides options to _onSubmit
   *
   * @typedef submitOptions
   * @property {boolean} preventClose - Should the application be stopped from closing?
   * @property {boolean} preventRender - Should the application be stopped from rendering?
   */

  /**
   * Override Foundry's default _onSubmit event to add our own behaviors
   *
   * @param {Event} event - The native form submit event
   * @param {submitOptions} options - Options for the _onSubmit event
   */
  // eslint-disable-next-line no-underscore-dangle
  async _onSubmit(event, { preventClose = false, preventRender = false } = {}) {
    // eslint-disable-next-line no-underscore-dangle
    super._onSubmit(event, {
      preventClose,
      preventRender,
    });
    // Generate gold
    const totalCost = await this.#getTotalCost(await this.getData());
    const gp = await this.object.items.find((item) => {
      const itemData = item.system;
      return (
        (item.name === game.i18n.localize("OSE.items.gp.short") ||
          item.name === "GP") && // legacy behavior used GP, even for other languages
        itemData.treasure
      );
    });
    if (!gp) {
      ui.notifications.error(game.i18n.localize("OSE.error.noGP"));
      return;
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
   *
   * @param {Event} event - The initial triggering submission event
   * @param {object} formData - The object of validated form data with which to update the object
   * @private
   */
  async #updateObject(event, formData) {
    event.preventDefault();

    const speaker = ChatMessage.getSpeaker({ actor: this });
    const templateData = await this.getData();
    const content = await renderTemplate(
      `${OSE.systemPath()}/templates/chat/inventory-list.html`,
      templateData
    );
    ChatMessage.create({
      content,
      speaker,
    });
    // Update the actor
    await this.object.update(formData);

    // Re-draw the updated sheet
    this.object.sheet.render(true);
  }

  // eslint-disable-next-line class-methods-use-this
  async #getTotalCost(data) {
    return data.items.reduce((total, item) => {
      if (!OseCharacterGpCost.PhysicalItemTypes.has(item.type) || item.system.treasure)
        return total;
      if (item.system.quantity.max)
        return total + (item.system.cost * item.system.quantity.value);
      return total + item.system.cost
    }, 0);
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find("a.auto-deduct").click(() => {
      this.submit();
    });
  }
}
