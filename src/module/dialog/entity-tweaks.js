/**
 * @file An application used to manage Actor configuration.
 */
import OSE from "../config";

export default class OseEntityTweaks extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "sheet-tweaks";
    options.template = `${OSE.systemPath()}/templates/actors/dialogs/tweaks-dialog.html`;
    options.width = 380;
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   *
   * @type {string}
   * @returns {string} - The app title
   */
  get title() {
    return `${this.object.name}: ${game.i18n.localize("OSE.dialog.tweaks")}`;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   *
   * @returns {object} - The template data
   */
  getData() {
    const data = foundry.utils.deepClone(this.object.data);
    if (data.type === "character") {
      data.isCharacter = true;
    }
    data.user = game.user;
    data.config = {
      ...CONFIG.OSE,
      ascendingAC: game.settings.get(game.system.id, "ascendingAC"),
    };
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }

  /**
   * This method is called upon form submission after form data is validated
   *
   * @param {Event} event - The initial triggering submission event
   * @param {object} formData - The object of validated form data with which to update the object
   * @private
   */
  // eslint-disable-next-line no-underscore-dangle
  async _updateObject(event, formData) {
    event.preventDefault();
    // Update the actor
    await this.object.update(formData);
    // Re-draw the updated sheet
    // eslint-disable-next-line no-underscore-dangle
    await this.object.sheet._render(true);
  }
}
