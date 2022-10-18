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

  #heaviestArmor;
  #overTreasureLimit;
  
  #halfEncumbered;
  #quarterEncumbered;
  #eighthEncumbered;
  
  /**
   * 
   * @param {OseDataModelCharacterEncumbrance} encumbrance An object representing the character's encumbrance values
   * @param {boolean} shouldCalculateMovement Should the class autocalculate movement?
   * @param {number} baseMoveRate The base move rate for the actor
   */
  constructor(
    encumbrance: OseDataModelCharacterEncumbrance = new OseDataModelCharacterEncumbrance(), 
    shouldCalculateMovement = true, 
    base = OseDataModelCharacterMove.baseMoveRate,
  ) {
    // Props necessary for any encumbrance variant
    this.#moveBase             = base;
    this.#autocalculate        = shouldCalculateMovement;
    this.#encumbranceVariant   = encumbrance.variant;
    this.#overEncumbranceLimit = encumbrance.encumbered;

    // Non-basic encumbrance variant props
    this.#halfEncumbered    = encumbrance.atHalfEncumbered;
    this.#quarterEncumbered = encumbrance.atQuarterEncumbered;
    this.#eighthEncumbered  = encumbrance.atEighthEncumbered;

    // Basic encumbrance variant props
    this.#overTreasureLimit = encumbrance.overSignificantTreasureThreshold;
    this.#heaviestArmor     = encumbrance.heaviestArmor;
  }

  #speedFromBasicEnc() {
    let base = this.#moveBase;
    
    switch (this.#heaviestArmor) {
      case 0: base = this.#moveBase;       break;
      case 1: base = this.#moveBase * .75; break;
      case 2: base = this.#moveBase * .50; break;
    }

    if (this.#overEncumbranceLimit)
      base = 0;
    else if (this.#overTreasureLimit)
      base -= 30;
    return base
  }

  #speedFromDetailedEnc() {
    if (this.#overEncumbranceLimit)    return 0;
    else if (this.#halfEncumbered)     return this.#moveBase * .25;
    else if (this.#quarterEncumbered)  return this.#moveBase * .50;
    else if (this.#eighthEncumbered)   return this.#moveBase * .75;
    else                               return this.#moveBase;
  }
  
  get base() {
    // Manual entry for movement
    if (!this.#autocalculate || this.#encumbranceVariant === "disabled")
      return this.#moveBase;
    // Detailed/Complete Encumbrance
    if (["detailed", "complete"].includes(this.#encumbranceVariant))
      return this.#speedFromDetailedEnc()
    // Basic Encumbrance
    else if (this.#encumbranceVariant === "basic")
      return this.#speedFromBasicEnc()

    return OseDataModelCharacterMove.baseMoveRate;
  }
  set base(value) {
    this.#moveBase = value;
  }

  get encounter() { return this.base / 3; }
  get overland() { return this.base / 5; }
}