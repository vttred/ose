/**
 * @file A class representing the "Basic" encumbrance scheme from Old School Essentials: Classic Fantasy
 */
import OseDataModelCharacterEncumbrance, {
  CharacterEncumbrance,
} from "./data-model-character-encumbrance";

// import { OSE } from '../../config';

/**
 * A set of options for configuring the
 * Basic encumbrance scheme
 */
type Options = {
  significantTreasure: number;
};

/**
 * @todo Add template path for encumbrance bar
 * @todo Add template path for inventory item row
 */
export default class OseDataModelCharacterEncumbranceBasic
  extends OseDataModelCharacterEncumbrance
  implements CharacterEncumbrance
{
  static templateEncumbranceBar = "";

  static templateInventoryRow = "";

  /**
   * The machine-readable label for this encumbrance scheme
   */
  static type = "basic";

  /**
   * The human-readable label for this encumbrance scheme
   */
  static localizedLabel = "OSE.Setting.EncumbranceBasic";

  /**
   * The base value for the amount of treasure that slows a character down
   */
  static significantTreasure = 800;

  /**
   * A map of strings to numbers indicating how heavy a set of armor is.
   * The heavier the armor, the slower you move.
   */
  static armorWeight = {
    unarmored: 0,
    light: 1,
    heavy: 2,
  };

  #weight;

  #treasureEncumbrance;

  #heaviestArmor;

  constructor(
    max = OseDataModelCharacterEncumbrance.baseEncumbranceCap,
    items: Item[] = [],
    options: Options = {} as Options
  ) {
    super(OseDataModelCharacterEncumbranceBasic.type, max);
    this.#treasureEncumbrance =
      options?.significantTreasure ||
      OseDataModelCharacterEncumbranceBasic.significantTreasure;

    this.#weight = items.reduce(
      (acc: number, { type, system: { treasure, quantity, weight } }: Item) =>
        type !== "item" || !treasure ? acc : acc + quantity.value * weight,
      0
    );

    this.#heaviestArmor = items.reduce(
      (heaviest, { type, system: { type: armorType, equipped } }) => {
        if (type !== "armor" || !equipped) return heaviest;
        if (
          armorType === "light" &&
          heaviest ===
            OseDataModelCharacterEncumbranceBasic.armorWeight.unarmored
        )
          return OseDataModelCharacterEncumbranceBasic.armorWeight.light;
        if (armorType === "heavy")
          return OseDataModelCharacterEncumbranceBasic.armorWeight.heavy;
        return heaviest;
      },
      OseDataModelCharacterEncumbranceBasic.armorWeight.unarmored
    );
  }

  get steps() {
    return [(100 * this.#treasureEncumbrance) / this.max];
  }

  get overTreasureThreshold() {
    return this.value >= this.#treasureEncumbrance;
  }

  get value() {
    return this.#weight;
  }

  get overSignificantTreasureThreshold() {
    return this.value >= this.#treasureEncumbrance;
  }

  get atThirdBreakpoint() {
    return (
      this.#heaviestArmor ===
        OseDataModelCharacterEncumbranceBasic.armorWeight.heavy &&
      this.value >= this.#treasureEncumbrance
    );
  }

  get atSecondBreakpoint() {
    const isHeavy =
      this.#heaviestArmor ===
      OseDataModelCharacterEncumbranceBasic.armorWeight.heavy;
    const isLightWithTreasure =
      this.#heaviestArmor ===
        OseDataModelCharacterEncumbranceBasic.armorWeight.light &&
      this.value >= this.#treasureEncumbrance;
    return isHeavy || isLightWithTreasure;
  }

  get atFirstBreakpoint() {
    return (
      this.#heaviestArmor ===
        OseDataModelCharacterEncumbranceBasic.armorWeight.light ||
      this.overSignificantTreasureThreshold
    );
  }
}
