import OseDataModelCharacterEncumbrance, { CharacterEncumbrance } from './data-model-character-encumbrance';
// import { OSE } from '../../config';

/**
 * @todo Add template path for encumbrance bar
 * @todo Add template path for inventory item row
 */
export default class OseDataModelCharacterEncumbranceDetailed extends OseDataModelCharacterEncumbrance implements CharacterEncumbrance {
  static templateEncumbranceBar = '';
  static templateInventoryRow = '';

  /**
   * The machine-readable label for this encumbrance scheme
   */
  static type = 'detailed';
  /**
   * The human-readable label for this encumbrance scheme
   */
  static localizedLabel = 'OSE.Setting.EncumbranceDetailed';

  /**
   * The weight (in coins) to add to the total weight value if the character has adventuring gear
   */
  static gearWeight = 80;

  #weight = 0;
  #hasAdventuringGear;

  constructor(
    max = OseDataModelCharacterEncumbrance.baseEncumbranceCap,
    items: Item[] = [],
  ) {
    super(OseDataModelCharacterEncumbranceDetailed.type, max)
    this.#hasAdventuringGear = !!items.filter((i: Item) => i.type === 'item' && !i.system.treasure).length;
    this.#weight = items.reduce((acc, { type, system: { treasure, quantity, weight } }: Item) => {
      if (type === 'spell' || type === 'ability') return acc;

      let value = acc;

      if (type === "item" && treasure)
        value += quantity.value * weight;
      if (["weapon", "armor", "container"].includes(type))
        value += weight;

      return value;
    }, 0) + (this.#hasAdventuringGear ? OseDataModelCharacterEncumbranceDetailed.gearWeight : 0);
  }

  get steps() {
    return Object.values(OseDataModelCharacterEncumbrance.encumbranceSteps);
  }

  get value(): number {
    return this.#weight;
  }
}