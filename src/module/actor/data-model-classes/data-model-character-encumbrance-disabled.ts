/**
 * @file A class representing the "Disabled" encumbrance scheme;
 *       we aren't tracking carry weight here.
 */
import OseDataModelCharacterEncumbrance, {
  CharacterEncumbrance,
} from "./data-model-character-encumbrance";

// import { OSE } from '../../config';

/**
 * @todo Add template path for encumbrance bar
 * @todo Add template path for inventory item row
 */
export default class OseDataModelCharacterEncumbranceDisabled
  extends OseDataModelCharacterEncumbrance
  implements CharacterEncumbrance
{
  static templateEncumbranceBar = "";

  static templateInventoryRow = "";

  /**
   * The machine-readable label for this encumbrance scheme
   */
  static type = "disabled";

  /**
   * The human-readable label for this encumbrance scheme
   */
  static localizedLabel = "OSE.Setting.EncumbranceDisabled";

  constructor() {
    super(OseDataModelCharacterEncumbranceDisabled.type);
  }

  // eslint-disable-next-line class-methods-use-this
  get value(): number {
    return 0;
  }
}
