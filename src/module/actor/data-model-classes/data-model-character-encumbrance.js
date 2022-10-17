/**
 * A class to handle character encumbrance.
 */
 export default class OseDataModelCharacterEncumbrance {
  static encumbranceCap = 1600;
  static encumbranceSteps = [.125, .25, .50];
  static detailedGearWeight = 80;
  static basicSignificantTreasure = 800;
  
  static basicArmorWeight = {
    unarmored: 0,
    light: 1,
    heavy: 2
  };

  #encumbranceVariant;
  #basicTreasureEncumbrance;
  #hasAdventuringGear;
  #weight;
  #max;
  #heaviestArmor;

  /**
   * 
   * @param {number} max The max weight this character can carry
   * @param {*} items The items this character is carrying
   */
  constructor(
    variant = 'disabled', 
    max = OseDataModelCharacterEncumbrance.encumbranceCap, 
    items = [],
    significantTreasure = OseDataModelCharacterEncumbrance.basicSignificantTreasure
  ) {
    this.#encumbranceVariant = variant;
    this.#basicTreasureEncumbrance = significantTreasure;
    this.#max = max;
    this.#hasAdventuringGear = !!items.filter(i => i.type === 'item' && !i.system.treasure).length;
    this.#weight = items.reduce((acc, {type, system: {treasure, quantity, weight}}) => {
      if (
        type === "item" &&
        (["complete", "disabled"].includes(variant) || treasure)
      ) return acc + quantity.value * weight;
      if (
        ["weapon", "armor", "container"].includes(type) &&
        variant !== "basic"
      ) return acc + weight;

      return acc;
    }, 0);

    this.#heaviestArmor = items.reduce((heaviest, {type, system: {type: armorType, equipped}}) => {
      if (type !== 'armor' || !equipped) return heaviest;
      if (armorType === 'light' && heaviest === OseDataModelCharacterEncumbrance.basicArmorWeight.unarmored)
        return OseDataModelCharacterEncumbrance.basicArmorWeight.light;
      else if (armorType === "heavy")
        return OseDataModelCharacterEncumbrance.basicArmorWeight.heavy;
      return heaviest;
    }, OseDataModelCharacterEncumbrance.basicArmorWeight.unarmored);
  }

  get variant() {
    return this.#encumbranceVariant;
  }
  get enabled() {
    return this.#encumbranceVariant !== 'disabled'
  }
  get pct() {
    return Math.clamped((100 * this.value) / this.max, 0, 100)
  };
  get encumbered() {
    return this.value >= this.max;
  }
  get steps() {
    let steps = [];

    if (["complete", "detailed"].includes(this.#encumbranceVariant))
      return OseDataModelCharacterEncumbrance.encumbranceSteps;
    else if(this.#encumbranceVariant === 'basic')
      steps = [this.#basicTreasureEncumbrance]

    return steps.map((s) => (100 * s) / this.max);
  };
  get value() {
    let weight = this.#weight;
    if (this.#encumbranceVariant === 'detailed' && this.#hasAdventuringGear)
      weight += OseDataModelCharacterEncumbrance.detailedGearWeight;

    return weight;
  };
  
  get max() { return this.#max; };
  set max(value) { this.#max = value; }

  get heaviestArmor() { return this.variant === 'basic' ? this.#heaviestArmor : null }
  get overSignificantTreasureThreshold() {
    return this.variant === 'basic'
      ? this.value >= this.#basicTreasureEncumbrance
      : null;
  }
  
  get #delta() { return this.max - OseDataModelCharacterEncumbrance.encumbranceCap; };
  get atHalfEncumbered() {
    return this.variant === 'basic'
      ? null
      : this.value >= this.max * OseDataModelCharacterEncumbrance.encumbranceSteps[2] + this.#delta 
  }
  get atQuarterEncumbered() {
    return this.variant === 'basic'
      ? null
      : this.value >= this.max * OseDataModelCharacterEncumbrance.encumbranceSteps[1] + this.#delta
  }
  get atEighthEncumbered() {
    return this.variant === 'basic'
      ? null
      : this.value >= this.max * OseDataModelCharacterEncumbrance.encumbranceSteps[0] + this.#delta 
  }
}

