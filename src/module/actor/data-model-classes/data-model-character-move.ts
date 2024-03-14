/**
 * @file A class representing the character's ability to move, depending on encumbrance state
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import OseDataModelCharacterEncumbrance from "./data-model-character-encumbrance";

export interface CharacterMove {
  base: number;
  encounter: number;
  overland: number;
}

/**
 * A class representing a character's move speeds.
 */
export default class OseDataModelCharacterMove implements CharacterMove {
  static baseMoveRate = 120;

  #moveBase;

  #autocalculate;

  #encumbranceVariant;

  #overEncumbranceLimit;

  #atFirstBreakpoint;

  #atSecondBreakpoint;

  #atThirdBreakpoint;

  /**
   * The constructor
   *
   * @param {OseDataModelCharacterEncumbrance} encumbrance - An object representing the character's encumbrance values
   * @param {boolean} shouldCalculateMovement - Should the class autocalculate movement?
   * @param {number} base - The base move rate for the actor
   */
  constructor(
    encumbrance: OseDataModelCharacterEncumbrance = new OseDataModelCharacterEncumbrance(),
    shouldCalculateMovement = true,
    base = OseDataModelCharacterMove.baseMoveRate
  ) {
    // Props necessary for any encumbrance variant
    this.#moveBase = base;
    this.#autocalculate = shouldCalculateMovement;
    this.#encumbranceVariant = encumbrance.variant;
    this.#overEncumbranceLimit = encumbrance.encumbered;

    // Encumbrance Breakpoints
    this.#atFirstBreakpoint = encumbrance.atFirstBreakpoint;
    this.#atSecondBreakpoint = encumbrance.atSecondBreakpoint;
    this.#atThirdBreakpoint = encumbrance.atThirdBreakpoint;
  }

  #derivedSpeed() {
    if (this.#overEncumbranceLimit) return 0;
    if (this.#atThirdBreakpoint) return this.#moveBase * 0.25;
    if (this.#atSecondBreakpoint) return this.#moveBase * 0.5;
    return this.#atFirstBreakpoint ? this.#moveBase * 0.75 : this.#moveBase;
  }

  get base() {
    // Manual entry for movement
    if (!this.#autocalculate || this.#encumbranceVariant === "disabled")
      return this.#moveBase;
    // Automatic calculation for movement
    return this.#derivedSpeed();
  }

  set base(value) {
    this.#moveBase = value;
  }

  get encounter() {
    return this.base / 3;
  }

  get overland() {
    return this.base / 5;
  }
}
