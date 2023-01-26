export interface CharacterEncumbrance {
  variant: string;
  enabled: boolean;
  pct: number;
  encumbered: boolean;
  steps: number[];
  value: number;
  max: number;
  atHalfEncumbered: boolean | null;
  atThreeEighthsEncumbered: boolean | null;
  atQuarterEncumbered: boolean | null;
};

/**
 * A class to handle character encumbrance.
 */
 export default class OseDataModelCharacterEncumbrance implements CharacterEncumbrance {
  static baseEncumbranceCap = 1600;
  static encumbranceSteps = {
    quarter: 25,
    threeEighths: 37.5,
    half: 50
  };

  #encumbranceVariant;
  #max;
  #weight = 0;

  /**
   * 
   * @param max The max weight this character can carry
   * @param items The items this character is carrying
   */
  constructor(
    variant = 'disabled', 
    max = OseDataModelCharacterEncumbrance.baseEncumbranceCap, 
  ) {
    this.#encumbranceVariant = variant;
    this.#max = max;
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
    return this.value > this.max;
  }
  get steps(): number[] {
    return [];
  };
  get value(): number {
    return this.#weight;
  };
  
  get max() { return this.#max; };
  set max(value) { this.#max = value; }

  get #delta() { return this.max - OseDataModelCharacterEncumbrance.baseEncumbranceCap; };

  get atHalfEncumbered() {
    return this.value > this.max * (OseDataModelCharacterEncumbrance.encumbranceSteps.half / 100) + (this.#delta || 0)
  }
  get atThreeEighthsEncumbered() {
    return this.value > this.max * (OseDataModelCharacterEncumbrance.encumbranceSteps.threeEighths / 100) + (this.#delta || 0)
  }
  get atQuarterEncumbered() {
    return this.value > this.max * (OseDataModelCharacterEncumbrance.encumbranceSteps.quarter / 100) + (this.#delta || 0)
  }
  
}

