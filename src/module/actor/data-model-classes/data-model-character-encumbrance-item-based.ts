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

  constructor(
    max = OseDataModelCharacterEncumbrance.baseEncumbranceCap,
    items: Item[] = []
  ) {
    super(OseDataModelCharacterEncumbranceItemBased.type, max);
    this.#weight = items.reduce(
      (acc, { type, system: { quantity, itemslots } }: Item) => {
        if (type === "item") return acc + quantity.value * itemslots;
        if (["weapon", "armor", "container"].includes(type))
          return acc + itemslots;
        return acc;
      },
      0
    );
  }

  // eslint-disable-next-line class-methods-use-this
  get steps() {
    return Object.values(OseDataModelCharacterEncumbrance.encumbranceSteps);
  }

  get value(): number {
    return this.#weight;
  }
}
