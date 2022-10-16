import OseDataModelCharacterEncumbrance from "./OseDataModelCharacterEncumbrance";

/**
 * A class representing a character's move speeds.
 */
export default class OseDataModelCharacterMove {
  static baseMoveRate = 120;
  
  #encumbranceVariant;
  #encumbranceCurrent;
  #encumbranceMax;
  #encumbranceDelta;
  #overTreasureLimit;
  #overEncumbranceLimit;
  #moveBase;
  #autocalculate;
  #heaviestArmor;

  /**
   * 
   * @param {OseDataModelCharacterEncumbrance} encumbrance An object representing the character's encumbrance values
   * @param {boolean} shouldCalculateMovement Should the class autocalculate movement?
   * @param {number} baseMoveRate The base move rate for the actor
   */
  constructor(
    encumbrance, 
    shouldCalculateMovement = true, 
    base = OseDataModelCharacterMove.baseMoveRate,
  ) {
    this.#encumbranceVariant = encumbrance.variant;
    this.#overTreasureLimit = encumbrance.overSignificantTreasureThreshold;
    this.#overEncumbranceLimit = encumbrance.encumbered;
    this.#encumbranceCurrent = encumbrance.value;
    this.#encumbranceMax = encumbrance.max;
    this.#encumbranceDelta = encumbrance.max - OseDataModelCharacterEncumbrance.encumbranceCap;
    this.#heaviestArmor = encumbrance.heaviestArmor;
    this.#autocalculate = shouldCalculateMovement;
    this.#moveBase = base;
  }

  #speedFromBasicEnc() {
    const weight = this.#encumbranceCurrent;

    let base = this.#moveBase;
    let heaviest = 0;

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
    const delta  = this.#encumbranceDelta;
    const weight = this.#encumbranceCurrent;
    
    let speed = this.#moveBase;

    if (weight >= this.#encumbranceMax) speed = 0;
    // @TODO could this be handled with percentages?
    else if (weight > 800 + delta) speed = this.#moveStep3;
    else if (weight > 600 + delta) speed = this.#moveStep2;
    else if (weight > 400 + delta) speed = this.#moveStep1;
    
    return speed;
  }
  
  get base() {
    let base;
    
    // Manual entry for movement
    if (!this.#autocalculate || this.#encumbranceVariant === "disabled")
      base = this.#moveBase;
    // Detailed/Complete Encumbrance
    if (["detailed", "complete"].includes(this.#encumbranceVariant))
      base = this.#speedFromDetailedEnc()
    // Basic Encumbrance
    else if (this.#encumbranceVariant === "basic")
      base = this.#speedFromBasicEnc()

    return base;
  }
  set base(value) {
    this.#moveBase = value;
  }

  get encounter() { return this.base / 3; }
  get overland() { return this.base / 5; }

  get #moveStep1() { return this.base * .75; }
  get #moveStep2() { return this.base * .5; }
  get #moveStep3() { return this.base * .25; }
}