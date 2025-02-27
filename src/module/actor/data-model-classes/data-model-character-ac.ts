/**
 * @file A class to handle the nested AC/AAC props on OseDataModelCharacter.
 */

interface CharacterAC {
  base: number;
  naked: number;
  shield: number;
  value: number;
  mod: number;
  bonus: number;
}

export default class OseDataModelCharacterAC implements CharacterAC {
  static baseAscending = 10;

  static baseDescending = 9;

  static propAscending = "aac";

  static propDescending = "ac";

  #armor;

  #dexMod;

  #mod;

  #acProp;

  #isAscending;

  #bonus;

  /**
   * AC Constructor
   *
   * @param {boolean} isAscending - Is this meant to represent ascending or descending AC?
   * @param {Item} armor - Currently equipped Items with type of armor
   * @param {number} dexMod - The bonus/penalty, from -3 to +3, applied to AC.
   * @param {number} mod - Miscellaneous modifier to AC
   */
  constructor(isAscending = false, armor: Item[] = [], dexMod = 0, mod = 0) {
    this.#isAscending = isAscending;
    this.#armor = armor;
    this.#dexMod = dexMod;
    this.#mod = mod;
    this.#acProp = this.#isAscending
      ? OseDataModelCharacterAC.propAscending
      : OseDataModelCharacterAC.propDescending;
    this.#bonus = 0;
  }

  #getShieldBonus() {
    return this.#armor.find(({ system: { type } }: Item) => type === "shield")
      ?.system[this.#acProp].value;
  }

  /**
   * The base AC value for a character, depending on
   * if we're using ascending or descending AC
   *
   * @returns {boolean} - Truthy for ascending, falsy for descending
   */
  get base() {
    return this.#isAscending
      ? OseDataModelCharacterAC.baseAscending
      : OseDataModelCharacterAC.baseDescending;
  }

  /**
   * A character's armor class without armor or a shield
   *
   * @returns {number} - The character's naked AC
   */
  get naked() {
    return this.#isAscending
      ? this.base + this.#dexMod
      : this.base - this.#dexMod;
  }

  /**
   * A character's shield bonus, if any
   *
   * @returns {number} - The shield bonus
   */
  get shield() {
    return this.#getShieldBonus();
  }

  /**
   * The AC value from worn armor
   *
   * @todo After data migration, armor should be a bonus to naked AC.
   * @returns {number} - The AC value from worn armor
   */
  get #armored() {
    const armor = this.#armor.find(
      ({ system: { type } }: Item) => type !== "shield"
    )?.system[this.#acProp].value;
    // Null if any falsy value but 0
    if (!armor && armor !== 0) return null;

    return this.#isAscending ? armor + this.#dexMod : armor - this.#dexMod;
  }

  /**
   * A character's armor class
   *
   * @todo Data migration for armor with AC/AAC to act as a bonus, not an override
   * @returns {number} - The creature's AC
   */
  get value() {
    const base = this.#armored === null ? this.naked : this.#armored;
    return this.#isAscending
      ? base + this.shield + this.mod + this.#bonus
      : base - this.shield - this.mod - this.#bonus;
  }

  // @TODO This will need to be editable once we get to creatures
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  set value(_change: number) {} // eslint-disable-line class-methods-use-this

  /**
   * A character's miscellaneous armor class modifier
   *
   * @returns {number} - The creature's AC modifier
   */
  get mod() {
    return this.#mod;
  }

  set mod(change) {
    this.#mod = change;
  }

  get bonus() {
    return this.#bonus;
  }

  set bonus(change) {
    this.#bonus = change;
  }
}
