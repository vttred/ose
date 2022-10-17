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
  constructor(isAscending = false, armor = [], dexMod = 0, mod = 0) {
    this.#isAscending = isAscending;
    this.#armor = armor;
    this.#dexMod = dexMod;
    this.#mod = mod;
    this.#acProp = (this.#isAscending)
      ? OseDataModelCharacterAC.propAscending
      : OseDataModelCharacterAC.propDescending;
  }

  #getShieldBonus() {
    return this.#armor.find(
      ({system: {type}}) => type === 'shield'
    )?.system[this.#acProp].value || 0;
  }

  get base() {
    return (this.#isAscending)
      ? OseDataModelCharacterAC.baseAscending
      : OseDataModelCharacterAC.baseDescending
  }

  /**
   * A character's armor class without armor or a shield
   */
  get naked() {
     return (this.#isAscending)
      ? this.base + this.#dexMod
      : this.base - this.#dexMod;
  }
  /**
   * A character's shield bonus, if any
   */
  get shield() {
    return this.#getShieldBonus();
  }
  
  /**
   * @todo After data migration, armor should be a bonus to naked AC.
   */
  get #armored() {
    const armor = this.#armor.find(
      ({system: {type}}) => type !== 'shield'
    )?.system[this.#acProp].value;
    // Null if any falsy value but 0
    if (!armor && armor !== 0) return null;
    
    return (this.#isAscending)
      ? armor + this.#dexMod
      : armor - this.#dexMod
  }
  
  /**
   * A character's armor class
   * @todo Data migration for armor with AC/AAC to act as a bonus, not an override
   */
  get value() {
    let base = (this.#armored !== null) ? this.#armored : this.naked;
    return (this.#isAscending)
      ? base + this.shield + this.mod
      : base - this.shield - this.mod;
  }
  // @TODO This will need to be editable once we get to creatures
  set value(change) { return; }
  /**
   * A character's miscellaneous armor class modifier
   */
  get mod() { return this.#mod }
  set mod(change) { this.#mod = change }
}

