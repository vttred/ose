// eslint-disable-next-line no-unused-vars

export class OseCharacterGpCost extends FormApplication {
  constructor(event, preparedData, position) {
    super(event, position);
    this.object.preparedData = preparedData;
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    (options.classes = ["ose", "dialog", "gp-cost"]),
      (options.id = "sheet-gp-cost");
    options.template =
      "systems/ose/dist/templates/actors/dialogs/gp-cost-dialog.html";
    options.width = 240;
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   * @type {String}
   */
  get title() {
    return `${this.object.name}: GP Cost`;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  async getData() {
    const data = await foundry.utils.deepClone(this.object.preparedData);
    data.totalCost = this._getTotalCost(data);
    data.user = game.user;
    return data;
  }

  async close(options) {
    return super.close(options);
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
    const templateData = {
      gold: this.gold,
    };
    const content = await renderTemplate(
      "systems/ose/dist/templates/chat/inventory-list.html",
      templateData
    );
    ChatMessage.create({
      content: content,
      speaker,
    });
    // Update the actor
    await this.object.update(formData);

    // Re-draw the updated sheet
    this.object.sheet.render(true);
  }

  async _getTotalCost(data) {
    let total = 0;
    const physical = ["item", "container", "weapon", "armor"];
    for (item in data.items) {
      if (physical.some((item) => item.type)) total += item.cost;
    }
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
