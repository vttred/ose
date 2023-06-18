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
          initial: "inventory",
        },
      ],
      dragDrop: [{
        dragSelector: '.item',
        dropSelector: '[data-tab="inventory"] expandable-section, expandable-section[type="container"] item-row'
      }]
      // filter: [{inputSelector: 'input[name="inventory-search"]', contentSelector: "[data-tab='inventory'] inventory-row"}]
    });
  }

  get favoriteItems() {
    const itemIds = (this.actor.getFlag(game.system.id, "favorite-items") ||
      []) as string[];
    return itemIds.map((id) => fromUuid(id));
  }

  get enrichedBiography() {
    return TextEditor.enrichHTML(
      this.actor.system.details.biography,
      { async: true }
    );
  }

  get enrichedNotes() {
    return TextEditor.enrichHTML(this.actor.system.details.notes,
      { async: true }
    );
  }

  async getData() {
    const favoriteItems = await Promise.all(this.favoriteItems);
    return {
      ...super.getData(),
      favoriteItems: favoriteItems.filter(i => !!i),
      enrichedBiography: await this.enrichedBiography,
      enrichedNotes: await this.enrichedNotes
    };
  }

  // eslint-disable-next-line no-underscore-dangle
  async _onChangeInput(e: any) {
    // eslint-disable-next-line no-underscore-dangle
    await super._onChangeInput(e);
  }

  async #onDropIntoContainer(e: Event) {
    const {type, uuid} = TextEditor.getDragEventData(e.originalEvent) as {type: string, uuid: string};
    if (type !== "Item") return;
    const itemToContain = await fromUuid(uuid);
    const container = await fromUuid(e.target.getAttribute("uuid"))

    if (!container || !itemToContain) return;

    itemToContain.update({
      'system.containerId': container.id
    })
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   *
   * @param html - {HTML}   The prepared HTML object ready to be rendered into the DOM
   *
   * @todo Click to roll against ability score
   * @todo CLick to roll against save
   * @todo Click to roll HD
   */
  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.on("change", "ability-score-field, character-info-field", (e) =>
      // eslint-disable-next-line no-underscore-dangle
      this._onChangeInput(e)
    );

    html.on("drop", "expandable-section[type='container']", this.#onDropIntoContainer.bind(this))
  }
}
