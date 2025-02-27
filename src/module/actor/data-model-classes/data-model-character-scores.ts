/**
 * @file A class representing a Character's ability scores.
 */

/**
 * An incoming score object
 *
 * @typedef {object} IncomingScore
 * @property {number} value - The base value of the score
 * @property {number} dynamic - Dynamic adjustments to the score from Active Effects
 * @property {number} bonus - Static bonuses to the score
 */
type IncomingScore = {
  value: number;
  bonus: number;
};

type Scores = {
  str: BaseScore;
  int: BaseScore;
  wis: BaseScore;
  dex: BaseScore;
  con: BaseScore;
  cha: BaseScore;
};

type BaseScore = IncomingScore & { mod: number; total: number };

export interface CharacterScores {
  str: BaseScore & { od: number };
  int: BaseScore & { literacy: string; spoken: string };
  wis: BaseScore;
  dex: BaseScore & { init: number };
  con: BaseScore;
  cha: BaseScore & { loyalty: number; retain: number; npc: number };
}

/**
 * A class representing a character's ability scores
 */
export default class OseDataModelCharacterScores implements CharacterScores {
  /**
   * Standard modifiers, from -3 to 3.
   *
   * Applied to:
   * - `str.mod`
   * - `int.mod`
   * - `wis.mod`
   * - `dex.mod`
   * - `con.mod`
   * - `cha.mod`
   * - `cha.retain` (with a +4 modifier)
   * - `cha.loyalty` (with a +7 modifier)
   */
  static standardAttributeMods = {
    0: -3,
    3: -3,
    4: -2,
    6: -1,
    9: 0,
    13: 1,
    16: 2,
    18: 3,
  };

  /**
   * Capped modifiers, from -2 to 2.
   *
   * Applied to:
   * - `dex.init`
   * - `cha.npc`
   */
  static cappedAttributeMods = {
    0: -2,
    3: -2,
    4: -1,
    6: -1,
    9: 0,
    13: 1,
    16: 1,
    18: 2,
  };

  /**
   * Modifier tables for the Open Door exploration skill, from 0 to 5.
   * Applied to:
   * - `str.od`
   */
  static openDoorMods = {
    0: 0,
    3: 1,
    9: 2,
    13: 3,
    16: 4,
    18: 5,
  };

  /**
   * Mapping tables for character literacy.
   * Applied to:
   * - `int.literacy`
   */
  static literacyMods = {
    0: "",
    3: "OSE.Illiterate",
    6: "OSE.LiteracyBasic",
    9: "OSE.Literate",
  };

  /**
   * Mapping tables for character's spoken languages.
   * Applied to:
   * - `int.spoken`
   */
  static spokenMods = {
    0: "OSE.NativeBroken",
    3: "OSE.Native",
    13: "OSE.NativePlus1",
    16: "OSE.NativePlus2",
    18: "OSE.NativePlus3",
  };

  static valueFromTable(table: { [str: string]: any }, val: number) {
    let output;
    for (let i = 0; i <= val; i += 1) {
      if (table[i] !== undefined) {
        output = table[i];
      }
    }
    return output;
  }

  static #getTotal(score: IncomingScore): number {
    return score.value + score.bonus;
  }

  #str: IncomingScore = { value: 0, bonus: 0 };

  #int: IncomingScore = { value: 0, bonus: 0 };

  #wis: IncomingScore = { value: 0, bonus: 0 };

  #dex: IncomingScore = { value: 0, bonus: 0 };

  #con: IncomingScore = { value: 0, bonus: 0 };

  #cha: IncomingScore = { value: 0, bonus: 0 };

  /**
   * The constructor
   *
   * @param {object} scores - An object containing the six primary ability scores.
   * @param {string} scores.str - The character's strength
   * @param {string} scores.int - The character's intelligence
   * @param {string} scores.wis - The character's wisdom
   * @param {string} scores.dex - The character's dexterity
   * @param {string} scores.con - The character's constitution
   * @param {string} scores.cha - The character's charisma
   */
  constructor({ str, int, wis, dex, con, cha }: Scores) {
    this.#str = str ?? 0;
    this.#int = int ?? 0;
    this.#wis = wis ?? 0;
    this.#dex = dex ?? 0;
    this.#con = con ?? 0;
    this.#cha = cha ?? 0;
  }

  get str() {
    return {
      value: this.#str.value,
      bonus: this.#str.bonus,
      total: OseDataModelCharacterScores.#getTotal(this.#str),
      mod: this.#strMod,
      od: this.#strOpenDoorsMod,
    };
  }

  set str(change) {
    this.#str = {
      ...this.#str,
      ...change,
    };
  }

  get #strMod() {
    return OseDataModelCharacterScores.valueFromTable(
      OseDataModelCharacterScores.standardAttributeMods,
      this.#str.value
    );
  }

  get #strOpenDoorsMod() {
    return OseDataModelCharacterScores.valueFromTable(
      OseDataModelCharacterScores.openDoorMods,
      this.#str.value
    );
  }

  get int() {
    return {
      value: this.#int.value,
      bonus: this.#int.bonus,
      total: OseDataModelCharacterScores.#getTotal(this.#int),
      mod: this.#intMod,
      literacy: this.#intLiteracyMod,
      spoken: this.#intSpokenLanguagesMod,
    };
  }

  set int(change) {
    this.#int = {
      ...this.#int,
      ...change,
    };
  }

  get #intMod() {
    return OseDataModelCharacterScores.valueFromTable(
      OseDataModelCharacterScores.standardAttributeMods,
      this.#int.value
    );
  }

  get #intLiteracyMod() {
    return OseDataModelCharacterScores.valueFromTable(
      OseDataModelCharacterScores.literacyMods,
      this.#int.value
    );
  }

  get #intSpokenLanguagesMod() {
    return OseDataModelCharacterScores.valueFromTable(
      OseDataModelCharacterScores.spokenMods,
      this.#int.value
    );
  }

  get wis() {
    return {
      value: this.#wis.value,
      bonus: this.#wis.bonus,
      total: OseDataModelCharacterScores.#getTotal(this.#wis),
      mod: this.#wisMod,
    };
  }

  set wis(change) {
    this.#wis = {
      ...this.#wis,
      ...change,
    };
  }

  get #wisMod() {
    return OseDataModelCharacterScores.valueFromTable(
      OseDataModelCharacterScores.standardAttributeMods,
      this.#wis.value
    );
  }

  get dex() {
    return {
      value: this.#dex.value,
      bonus: this.#dex.bonus,
      total: OseDataModelCharacterScores.#getTotal(this.#dex),
      mod: this.#dexMod,
      init: this.#dexInitMod,
    };
  }

  set dex(change) {
    this.#dex = {
      ...this.#dex,
      ...change,
    };
  }

  get #dexMod() {
    return OseDataModelCharacterScores.valueFromTable(
      OseDataModelCharacterScores.standardAttributeMods,
      this.#dex.value
    );
  }

  get #dexInitMod() {
    return OseDataModelCharacterScores.valueFromTable(
      OseDataModelCharacterScores.cappedAttributeMods,
      this.#dex.value
    );
  }

  get con() {
    return {
      value: this.#con.value,
      bonus: this.#con.bonus,
      total: OseDataModelCharacterScores.#getTotal(this.#con),
      mod: this.#conMod,
    };
  }

  set con(change) {
    this.#con = {
      ...this.#con,
      ...change,
    };
  }

  get #conMod() {
    return OseDataModelCharacterScores.valueFromTable(
      OseDataModelCharacterScores.standardAttributeMods,
      this.#con.value
    );
  }

  get cha() {
    return {
      value: this.#cha.value,
      bonus: this.#cha.bonus,
      total: OseDataModelCharacterScores.#getTotal(this.#cha),
      mod: this.#chaMod,
      loyalty: this.#chaLoyaltyMod,
      retain: this.#chaRetainMod,
      npc: this.#chaReactionMod,
    };
  }

  set cha(change) {
    this.#cha = {
      ...this.#cha,
      ...change,
    };
  }

  get #chaMod() {
    return OseDataModelCharacterScores.valueFromTable(
      OseDataModelCharacterScores.standardAttributeMods,
      this.#cha.value
    );
  }

  get #chaReactionMod() {
    return OseDataModelCharacterScores.valueFromTable(
      OseDataModelCharacterScores.cappedAttributeMods,
      this.#cha.value
    );
  }

  get #chaRetainMod() {
    return this.#chaMod + 4;
  }

  get #chaLoyaltyMod() {
    return this.#chaMod + 7;
  }
}
