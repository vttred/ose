import OseDataModelCharacterEncumbrance, {CharacterEncumbrance} from './data-model-character-encumbrance';
// import { OSE } from '../../config';

/**
 * @todo Add template path for encumbrance bar
 * @todo Add template path for inventory item row
 */
export default class OseDataModelCharacterEncumbranceComplete extends OseDataModelCharacterEncumbrance implements CharacterEncumbrance {
	static templateEncumbranceBar = '';
	static templateInventoryRow = '';
	
	/**
	 * The machine-readable label for this encumbrance scheme
	 */
	static type = 'complete';
	/**
	 * The human-readable label for this encumbrance scheme
	 */
	static localizedLabel = 'OSE.Setting.EncumbranceComplete';
	
	#weight;
	
	constructor(
		max = OseDataModelCharacterEncumbrance.baseEncumbranceCap,
		items: Item[] = [],
	) {
		super(OseDataModelCharacterEncumbranceComplete.type, max)
    this.#weight = items.reduce((acc, {type, system: {quantity, weight}}: Item) => {
      if (type === "item")
        return acc + quantity.value * weight;
      if (["weapon", "armor", "container"].includes(type))
        return acc + weight;
      return acc;
    }, 0);
  }
	
	get steps() {
    return Object.values(OseDataModelCharacterEncumbrance.encumbranceSteps);
	}	

  get value(): number {
    return this.#weight;
  };
}