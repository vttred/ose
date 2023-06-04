/**
 * @file Extend the basic ActorSheet with some very simple modifications
 */
import { OSE } from "../config";

// import OseCharacterCreator from "../dialog/character-creation";
// import OseCharacterGpCost from "../dialog/character-gp-cost";
// import OseCharacterModifiers from "../dialog/character-modifiers";

/**
 * The character sheet that will accompany v2.0 of the system.
 */
export default class OseActorSheetCharacterV2 extends ActorSheet {
  /**
   * Extend and override the default options used by the base Actor Sheet
   *
   * @returns {object} - The default options for this sheet.
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ose", "sheet", "actor", "character-2"],
      template: `${OSE.systemPath()}/templates/actors/character-sheet-2-0.hbs`,
      width: 668,
      height: 692,
      resizable: true,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "attributes",
        },
      ],
    });
  }

  // eslint-disable-next-line no-underscore-dangle
  async _onChangeInput(e: any) {
    // eslint-disable-next-line no-underscore-dangle
    await super._onChangeInput(e);
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   *
   * @param html - {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.on("change", "ability-score-field, character-info-field", (e) =>
      // eslint-disable-next-line no-underscore-dangle
      this._onChangeInput(e)
    );
  }
}
