/**
 * A class to handle the nested AC/AAC props on OseDataModelCharacter.
 */
 export default class OseDataModelCharacterAC {
  static baseAscending = 10;
  static baseDescending = 9;
  static propAscending = 'aac';
  static propDescending = 'ac';

  #armor;
  #dexMod;
  #mod;
  #acProp;
  #isAscending;

  /**
   * 
   * @param {number} mod - Miscellaneous modifier to AC
   * @param {Item} armor - Currently equipped Items with type of armor
   * @param {number} dexMod The bonus/penalty, from -3 to +3, applied to AC.
   * @param {boolean} isAscending Is this meant to represent ascending or descending AC?
   */
  constructor(mod, armor, dexMod = 0, isAscending = false) {
    this.#isAscending = isAscending;
    this.#armor = armor;
    this.#dexMod = dexMod;
    this.#mod = mod || 0;
    this.#acProp = (this.isAscending)
      ? OseDataModelCharacterAC.propAscending
      : OseDataModelCharacterAC.propDescending;
  }

  #getShieldBonus() {
    return this.#armor.find(
      ({system: {type}}) => type === 'shield'
    )?.[this.#acProp] || 0;
  }

  get base() {
    return (this.#isAscending)
      ? OseDataModelCharacterAC.baseAscending
      : OseDataModelCharacterAC.baseDescending
  }

  /**
   * A character's armor class without armor or a shield
   */
  get naked() { return this.base + this.#dexMod }
  /**
   * A character's shield bonus, if any
   */
  get shield() {
    return this.#getShieldBonus();
  }
  /**
   * A character's armor class
   * @todo Data migration for armor with AC/AAC to act as a bonus, not an override
   */
  get value() {
    let base = this.#armor.find(
      ({system: {type}}) => type !== 'shield'
    )?.system[this.#acProp].value || this.naked;

    return (this.#isAscending)
      ? base + this.#dexMod + this.shield + this.mod
      : base - this.#dexMod - this.shield - this.mod;
  }
  // @TODO This will need to be editable once we get to creatures
  set value(change) { return; }
  /**
   * A character's miscellaneous armor class modifier
   */
  get mod() { return this.#mod }
  set mod(change) { this.#mod = change }
}

