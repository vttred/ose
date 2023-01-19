/**
 * @file The base class for all encumbrance schemes. Feel free to extend this to make your own schemes!
 */
export interface CharacterEncumbrance {
  variant: string;
  enabled: boolean;
  pct: number;
  encumbered: boolean;
  steps: number[];
  value: number;
  max: number;
  atHalfEncumbered: boolean | null;
  atQuarterEncumbered: boolean | null;
  atEighthEncumbered: boolean | null;
}

/**
 * A class to handle character encumbrance.
 */
export default class OseDataModelCharacterEncumbrance
  implements CharacterEncumbrance
{
  static baseEncumbranceCap = 1600;

  static encumbranceSteps = {
    eighth: 12.5,
    quarter: 25,
    half: 50,
  };

  #encumbranceVariant;

  #max;

  #weight = 0;

  /**
   * The constructor
   *
   * @param {string} variant - The name of this encumbrance variant.
   * @param {number} max - The max weight this character can carry
   * @param {Item[]} items - The items this character is carrying. Note: we're not using this in the base class.
   */
  constructor(
    variant = "disabled",
    max = OseDataModelCharacterEncumbrance.baseEncumbranceCap,
    items = [] // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    this.#encumbranceVariant = variant;
    this.#max = max;
  }

  get variant() {
    return this.#encumbranceVariant;
  }

  get enabled() {
    return this.#encumbranceVariant !== "disabled";
  }

  get pct() {
    return Math.clamped((100 * this.value) / this.max, 0, 100);
  }

  get encumbered() {
    return this.value >= this.max;
  }

  // eslint-disable-next-line class-methods-use-this
  get steps(): number[] {
    return [];
  }

  get value(): number {
    return this.#weight;
  }

  get max() {
    return this.#max;
  }

  set max(value) {
    this.#max = value;
  }

  get #delta() {
    return this.max - OseDataModelCharacterEncumbrance.baseEncumbranceCap;
  }

  get atHalfEncumbered() {
    return (
      this.value >=
      this.max *
        (OseDataModelCharacterEncumbrance.encumbranceSteps.half / 100) +
        (this.#delta || 0)
    );
  }

  get atQuarterEncumbered() {
    return (
      this.value >=
      this.max *
        (OseDataModelCharacterEncumbrance.encumbranceSteps.quarter / 100) +
        (this.#delta || 0)
    );
  }

  get atEighthEncumbered() {
    return (
      this.value >=
      this.max *
        (OseDataModelCharacterEncumbrance.encumbranceSteps.eighth / 100) +
        (this.#delta || 0)
    );
  }
}
