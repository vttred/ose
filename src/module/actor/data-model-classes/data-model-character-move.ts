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

  #halfEncumbered;

  #quarterEncumbered;

  #eighthEncumbered;

  /**
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

    // Non-basic encumbrance variant props
    this.#halfEncumbered = encumbrance.atHalfEncumbered;
    this.#quarterEncumbered = encumbrance.atQuarterEncumbered;
    this.#eighthEncumbered = encumbrance.atEighthEncumbered;
  }

  #derivedSpeed() {
    if (this.#overEncumbranceLimit) return 0;
    if (this.#halfEncumbered) return this.#moveBase * 0.25;
    if (this.#quarterEncumbered) return this.#moveBase * 0.5;
    if (this.#eighthEncumbered) return this.#moveBase * 0.75;
    return this.#moveBase;
  }

  get base() {
    // Manual entry for movement
    if (!this.#autocalculate || this.#encumbranceVariant === "disabled")
      return this.#moveBase;
    // Automatic calculation for movement
    return this.#derivedSpeed();

    return OseDataModelCharacterMove.baseMoveRate;
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
