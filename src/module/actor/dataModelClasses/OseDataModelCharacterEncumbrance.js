/**
 * A class to handle character encumbrance.
 */
 export default class OseDataModelCharacterEncumbrance {
  static encumbranceCap = 1600;
  static encumbranceSteps = [800, 400, 200];
  static detailedGearWeight = 80;

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
  constructor(max = OseDataModelCharacterEncumbrance.encumbranceCap, items = []) {
    const option = game.settings.get(game.system.id, "encumbranceOption");
    
    this.#encumbranceVariant = option;
    this.#basicTreasureEncumbrance = game.settings.get(
      game.system.id,
      "significantTreasure"
    );
    this.#max = max;
    this.#hasAdventuringGear = !!items.filter(i => i.type === 'item' && !i.system.treasure).length;
    this.#weight = items.reduce((acc, {type, system: {treasure, quantity, weight}}) => {
      if (
        type === "item" &&
        (["complete", "disabled"].includes(option) || treasure)
      ) return acc + quantity.value * weight;
      if (
        ["weapon", "armor", "container"].includes(type) &&
        option !== "basic"
      ) return acc + weight;

      return acc;
    }, 0);

    // let heaviestArmor = 0;

    // items.forEach(({type, system: {type: armorType, equipped}}) => {
    //   if (!type === 'armor') return;
    //   if (!equipped) return;

    //   if (armorType === "light" && heaviestArmor === 0)
    //     heaviestArmor = 1;
    //   else if (armorType === "heavy")
    //     heaviestArmor = 2;
    // });

    this.#heaviestArmor = items.reduce((heaviest, {type, system: {type: armorType, equipped}}) => {
      if (!type === 'armor' || !equipped) return heaviest;

      if (armorType === "light" && heaviest === 0)
        return 1;
      else if (armorType === "heavy")
        return 2;
      return heaviest;
    }, 0);
  }

  get pct() {
    return Math.clamped((100 * this.value) / this.max, 0, 100)
  };
  get encumbered() {
    return this.value > this.max;
  }
  get steps() {
    let steps = [];

    if (["complete", "detailed"].includes(this.#encumbranceVariant))
      steps = OseDataModelCharacterEncumbrance.encumbranceSteps;
    else if(this.#encumbranceVariant === 'basic')
      steps = [this.basicTreasureEncumbrance]

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
  get delta() { return this.max - OseDataModelCharacterEncumbrance.encumbranceCap; };
  get heaviestArmor() { return this.#heaviestArmor }
}

