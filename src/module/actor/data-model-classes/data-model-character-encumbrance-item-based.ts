/**
 * @file A class representing the "Item-based" encumbrance scheme from Carcass Crawler Issue Two
 */
import OseDataModelCharacterEncumbrance, {
  CharacterEncumbrance,
} from "./data-model-character-encumbrance";

// import { OSE } from '../../config';

/**
 * @todo Add template path for encumbrance bar
 * @todo Add template path for inventory item row
 */
export default class OseDataModelCharacterEncumbranceItemBased
  extends OseDataModelCharacterEncumbrance
  implements CharacterEncumbrance
{
  static packedEncumbranceSteps = {
    fiveEighths: 62.5,
    threeQuarters: 75,
    sevenEighths: 87.5,
  };

  static equippedEncumbranceSteps = {
    oneThird: 33.33,
    fiveNinths: 55.55,
    sevenNinths: 77.77,
  };

  #equippedMax;

  #packedMax;

  #max;

  #atFiveEighths;
  #atThreeQuarters;
  #atSevenEights;

  #atOneThird;
  #atFiveNinths;
  #atSevenNinths;

  static templateEncumbranceBar = "";

  static templateInventoryRow = "";

  /**
   * The machine-readable label for this encumbrance scheme
   */
  static type = "itembased";

  /**
   * The human-readable label for this encumbrance scheme
   */
  static localizedLabel = "OSE.Setting.EncumbranceItemBased";

  #weight;

  #equippedWeight;

  #packedWeight;

  constructor(max = 16, items: Item[] = []) {
    super(OseDataModelCharacterEncumbranceItemBased.type, max);

    this.#packedMax = 16;
    this.#equippedMax = 9;
    this.#packedWeight = Math.ceil(
      items.reduce(
        (acc, { type, system: { quantity, itemslots, equipped } }: Item) => {
          if (type === "item" && !equipped)
            return acc + quantity.value * itemslots;
          if (["weapon", "armor", "container"].includes(type) && !equipped)
            return acc + itemslots;
          return acc;
        },
        0
      )
    );
    this.#equippedWeight = Math.ceil(
      items.reduce(
        (acc, { type, system: { quantity, itemslots, equipped } }: Item) => {
          if (type === "item" && equipped)
            return acc + quantity.value * itemslots;
          if (["weapon", "armor", "container"].includes(type) && equipped)
            return acc + itemslots;
          return acc;
        },
        0
      )
    );
    this.#weight = this.usingEquippedEncumbrance
      ? this.#equippedWeight
      : this.#packedWeight;

    this.#max = this.usingEquippedEncumbrance
      ? this.#equippedMax
      : this.#packedMax;

    this.#atFiveEighths = this.#weight > this.#max * (OseDataModelCharacterEncumbranceItemBased.packedEncumbranceSteps.fiveEighths / 100);
    this.#atThreeQuarters = this.#weight > this.#max * (OseDataModelCharacterEncumbranceItemBased.packedEncumbranceSteps.threeQuarters / 100);
    this.#atSevenEights = this.#weight > this.#max * (OseDataModelCharacterEncumbranceItemBased.packedEncumbranceSteps.sevenEighths / 100);
  
    this.#atOneThird = this.#weight > this.#max * (OseDataModelCharacterEncumbranceItemBased.equippedEncumbranceSteps.oneThird / 100);
    this.#atFiveNinths = this.#weight > this.#max * (OseDataModelCharacterEncumbranceItemBased.equippedEncumbranceSteps.fiveNinths / 100);
    this.#atSevenNinths = this.#weight > this.#max * (OseDataModelCharacterEncumbranceItemBased.equippedEncumbranceSteps.sevenNinths / 100);
      
  }

  // eslint-disable-next-line class-methods-use-this
  get steps() {
    return this.usingEquippedEncumbrance
      ? Object.values(
          OseDataModelCharacterEncumbranceItemBased.equippedEncumbranceSteps
        )
      : Object.values(
          OseDataModelCharacterEncumbranceItemBased.packedEncumbranceSteps
        );
  }

  get usingEquippedEncumbrance() {
    const equippedValues = Object.values(
      OseDataModelCharacterEncumbranceItemBased.equippedEncumbranceSteps
    );
    const packedValues = Object.values(
      OseDataModelCharacterEncumbranceItemBased.packedEncumbranceSteps
    );
    let equippedIndex = equippedValues.findIndex(
      (step) => step > (this.#equippedWeight / this.#equippedMax) * 100
    );
    equippedIndex = equippedIndex === -1 ? 4 : equippedIndex;
    let packedIndex = packedValues.findIndex(
      (step) => step > (this.#packedWeight / this.#packedMax) * 100
    );
    packedIndex = packedIndex === -1 ? 4 : packedIndex;
    return !!(equippedIndex >= packedIndex);
  }

  get value(): number {
    return this.#weight;
  }

  get max(): number {
    return this.#max;
  }

  get atFirstBreakpoint(): boolean {
    return this.usingEquippedEncumbrance
      ? this.#atOneThird
      : this.#atFiveEighths;
  }

  get atSecondBreakpoint(): boolean {
    return this.usingEquippedEncumbrance
      ? this.#atFiveNinths
      : this.#atThreeQuarters;
  }

  get atThirdBreakpoint(): boolean {
    return this.usingEquippedEncumbrance
      ? this.#atSevenNinths
      : this.#atSevenEights;
  }
}
