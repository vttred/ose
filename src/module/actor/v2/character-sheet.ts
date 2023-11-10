/**
 * @file Extend the basic ActorSheet with some very simple modifications
 */
import { OSE } from "../../config";
import skipRollDialogCheck from "../../helpers-behaviour";
import OseActor from "../entity";
import OseActorSheet from "./actor-sheet";

/**
 *    APPLICATIONS
 */
import OseCharacterCreator from "../../dialog/character-creation";
import OseCharacterGpCost from "../../dialog/character-gp-cost";
import OseCharacterModifiers from "../../dialog/character-modifiers";

/**
 *    CSS MODULES
 */
import '../../../css/components.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesCommon from '../../../css/sheets/character/character-sheet.module.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesAbilities from '../../../css/sheets/character/tab-ability.module.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesCombat from '../../../css/sheets/character/tab-combat.module.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesInventory from '../../../css/sheets/character/tab-inventory.module.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesMagic from '../../../css/sheets/character/tab-magic.module.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesNotes from '../../../css/sheets/character/tab-notes.module.css';


/**
 * The character sheet that will accompany v2.0 of the system.
 * 
 * ---
 * # Phase 1
 * 
 * At this phase, we have feature parity between the v1 sheet and the v2 sheet.
 * 
 * @todo - Abilities Tab: Languages
 * 
 * ---
 * # Phase 2
 * 
 * At this phase, the character sheet is stable enough to be the default sheet.
 * We can safely make bigger changes to underlying data (and propagate UI changes back to old sheets). 
 * 
 * @todo - General: How can we make Level/Class/XP/Next easier to manage for single/multiclass characters?
 * @todo - Abilities Tab: Multiple ability buckets (class skills, special skills, etc)
 * @todo - Inventory Tab: Handling for carried/not carried
 */
export default class OseActorSheetCharacterV2 extends OseActorSheet {
  /**
   * @ignore This isn't useful until we can use custom elements for data entry
   */
  static get InputFields () {
    return [
      "uft-character-info-field", 
      "uft-character-ability-field", 
      "uft-major-icon-field", 
      "uft-spell-slot-field"
    ].join(",");
  }

  /**
   * Extend and override the default options used by the base Actor Sheet
   *
   * @returns - The default options for this sheet.
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ose", "sheet", "actor", "character-2"],
      template: `${OSE.systemPath()}/templates/actors/character-sheet-2-0.hbs`,
      width: 668,
      height: 692,
      resizable: true,
    });
  }

  /**
   * 
   */
  get favoriteItems() {
    const itemIds = (this.actor.getFlag(game.system.id, "favorite-items") ||
      []) as string[];
    return itemIds
      .map((id: string) => fromUuidSync(id) as Item)
  }

  /**
   * The enriched notes text, with document links and other enrichments applied
   * @returns The enriched text, in a Promise
   */
  get enrichedBiography(): Promise<string> {
    return TextEditor.enrichHTML(
      // @ts-expect-error - Document.system isn't in the types package yet
      this.actor.system.details.biography,
      { async: true }
    ) as Promise<string>;
  }

  /**
   * The enriched notes text, with document links and other enrichments applied
   * @returns The enriched text, in a Promise
   */
  get enrichedNotes(): Promise<string> {
    return TextEditor.enrichHTML(
      // @ts-expect-error - Document.system isn't in the types package yet
      this.actor.system.details.notes,
      { async: true }
    ) as Promise<string>;
  }

  /**
   * @override
   * @returns Data to render on our template
   */
  // @ts-expect-error - this async function returns an object, TS wants it to return a promise
  async getData() {
    const favoriteList = await Promise.all(this.favoriteItems);
    const favoriteItems = favoriteList
      .filter((i: Item) => !!i && i.type !== "spell" && i.type !== "ability");
    const favoriteAbilities = favoriteList
      .filter((i: Item) => !!i && i.type === "ability")
    const enrichedBiography = await this.enrichedBiography;
    const enrichedNotes = await this.enrichedNotes;

    return {
      ...super.getData(),
      styles: {
        common: stylesCommon,
        ability: stylesAbilities,
        combat: stylesCombat,
        inventory: stylesInventory,
        magic: stylesMagic,
        notes: stylesNotes
      },
      favoriteItems,
      favoriteAbilities,
      enrichedBiography,
      enrichedNotes,
      usesAscendingAC: game.settings.get(game.system.id, "ascendingAC"),
      usesInitiativeModifiers: game.settings.get(game.system.id, "initiative") !== "group",
      encumbranceScheme: game.settings.get(game.system.id, "encumbranceOption"),
    };
  }

  /**
   * 
   * @param event 
   */
  #rollAttributeCheck(event: Event) {
    event.preventDefault();
    const score = (event?.target as HTMLElement)
      ?.closest('uft-labeled-section')
      ?.querySelector('input[name]')
      ?.getAttribute("name")
      ?.split(".")[2];
    // We can use this when uft-ability-score-field is usable
    // const score = (event.target as HTMLElement)?.getAttribute("name")?.split(".")[2];
    score && (this.actor as OseActor).rollCheck(score, {event});
  }

  /**
   * 
   * @param event 
   */
  #rollAttack (event: Event) {
    const { attackType } = ((event.target as HTMLElement)?.closest('[data-attack-type]') as HTMLElement)?.dataset;

    if (attackType)
      (this.actor as OseActor).targetAttack({ roll: {} }, attackType, {
        type: attackType,
        skipDialog: skipRollDialogCheck(event),
      });
  }

  /**
   * 
   * @param event 
   */
  #rollExploration (event: Event) {
    const { explorationType } = ((event.target as HTMLElement)?.closest('[data-exploration-type]') as HTMLElement)?.dataset;
    if (explorationType)
      (this.actor as OseActor).rollExploration(explorationType, {
        event,
      });
  }

  /**
   * 
   */
  #generateScores() {
    new OseCharacterCreator(this.actor).render(true);
  }

  /**
   * 
   */
  #showModifiers() {
    new OseCharacterModifiers(this.actor).render(true);
  }

  /**
   * 
   */
  #showGoldCost() {
    const items = {
      items: this.actor.items,
      owned: {
        // @ts-expect-error - Types package doesn't include system prop 
        weapons: this.actor.system.weapons,
        // @ts-expect-error - Types package doesn't include system prop 
        armors: this.actor.system.armor,
        // @ts-expect-error - Types package doesn't include system prop 
        items: this.actor.system.items,
        // @ts-expect-error - Types package doesn't include system prop 
        containers: this.actor.system.containers,
      }
    };
    new OseCharacterGpCost(this.actor, items).render(true);
  }

  /**
   * 
   * @todo This could go to a shared Actor Sheet class.
   * @param force 
   * @param options
   * @override 
   */
  async _render(force = false, options = {}) {
    const scrollTop = this.element.find('.window-content').scrollTop();
    await super._render(force, options);
    scrollTop && this.element.find('.window-content').scrollTop(scrollTop);
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   *
   * @param html - The prepared HTML object ready to be rendered into the DOM
   *
   * @todo Click to roll HD
   * @todo Many of these listeners could go to a shared Actor Sheet class.
   */
  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);

    super.viewListeners(html);
    super.editListeners(html);
  }

  viewListeners(html: JQuery<HTMLElement>): void {
    // Ability checks
    html.find('.ability-scores .ability-score-field label')
      .on('pointerdown', this.#rollAttributeCheck.bind(this))

    // Attacks
    html.find('.character-ability-field[data-attack-type] label')
      .on('pointerdown', this.#rollAttack.bind(this));

    // Exploration
    html.find('.character-ability-field[data-exploration-type] label')
      .on('pointerdown', this.#rollExploration.bind(this));
  }

  editListeners(html: JQuery<HTMLElement>): void {
    if (!this.isEditable) return;

    html.on("pointerdown", '[data-action="generate-scores"]', this.#generateScores.bind(this));
    html.on("pointerdown", '[data-action="modifiers"]', this.#showModifiers.bind(this));
    html.on("pointerdown", '[data-action="gp-cost"]', this.#showGoldCost.bind(this));
  }
}
