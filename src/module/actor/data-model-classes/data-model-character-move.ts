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

  #halfEncumbered;

  #threeEighthsEncumbered;

  #quarterEncumbered;

  #fiveEighthsEncumbered;

  #threeQuartersEncumbered;

  #sevenEighthsEncumbered;

  #usingEquippedEncumbrance;

  #oneThirdEncumbered;

  #fiveNinthsEncumbered;

  #sevenNinthsEncumbered;

  /**
   * The constructor
   *
   * @param {OseDataModelCharacterEncumbrance} encumbrance - An object representing the character's encumbrance values
   * @param {boolean} shouldCalculateMovement - Should the class autocalculate movement?
   * @param {number} base - The base move rate for the actor
   * @param {boolean} usingEquippedEncumbrance - Is the character using equipped encumbrance
   */
  constructor(
    encumbrance: OseDataModelCharacterEncumbrance = new OseDataModelCharacterEncumbrance(),
    shouldCalculateMovement = true,
    base = OseDataModelCharacterMove.baseMoveRate,
    usingEquippedEncumbrance = encumbrance.usingEquippedEncumbrance
  ) {
    // Props necessary for any encumbrance variant
    this.#moveBase = base;
    this.#autocalculate = shouldCalculateMovement;
    this.#encumbranceVariant = encumbrance.variant;
    this.#overEncumbranceLimit = encumbrance.encumbered;

    // Non-basic encumbrance variant props
    this.#halfEncumbered = encumbrance.atHalfEncumbered;
    this.#threeEighthsEncumbered = encumbrance.atThreeEighthsEncumbered;
    this.#quarterEncumbered = encumbrance.atQuarterEncumbered;

    // Item-based encumbrance variant props - packed steps
    this.#fiveEighthsEncumbered = encumbrance.atFiveEighthsEncumbered;
    this.#threeQuartersEncumbered = encumbrance.atThreeQuartersEncumbered;
    this.#sevenEighthsEncumbered = encumbrance.atSevenEighthsEncumbered;
    // Item-based encumbrance variant props - equipped steps
    this.#usingEquippedEncumbrance = usingEquippedEncumbrance;
    this.#oneThirdEncumbered = encumbrance.atOneThirdEncumbered;
    this.#fiveNinthsEncumbered = encumbrance.atFiveNinthsEncumbered;
    this.#sevenNinthsEncumbered = encumbrance.atSevenNinthsEncumbered;
  }

  #derivedSpeed() {
    if (this.#overEncumbranceLimit) return 0;
    if (this.#usingEquippedEncumbrance) {
      if (this.#sevenNinthsEncumbered) return this.#moveBase * 0.25;
      if (this.#fiveNinthsEncumbered) return this.#moveBase * 0.5;
      return this.#oneThirdEncumbered ? this.#moveBase * 0.75 : this.#moveBase;
    }
    if (this.#encumbranceVariant === "itembased") {
      if (this.#sevenEighthsEncumbered) return this.#moveBase * 0.25;
      if (this.#threeQuartersEncumbered) return this.#moveBase * 0.5;
      return this.#fiveEighthsEncumbered
        ? this.#moveBase * 0.75
        : this.#moveBase;
    }
    if (this.#halfEncumbered) return this.#moveBase * 0.25;
    if (this.#threeEighthsEncumbered) return this.#moveBase * 0.5;
    return this.#quarterEncumbered ? this.#moveBase * 0.75 : this.#moveBase;
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
