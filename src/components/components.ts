/**
 * FONTAWESOME
 */
import { config } from "@fortawesome/fontawesome-svg-core";

/**
 * COMPONENTS
 * @todo Once we can figure out how to make Foundry's focus-shifting
 *       code cooperate with custom elements with form fields inside, 
 *       we should revisit the commented-out components below. 
 */
// import "./AbilityScoreField/AbilityScoreField";
// import "./CharacterAbilityField/CharacterAbilityField";
// import "./CharacterInfoField/CharacterInfoField";
import "./CharacterInfoMeter/CharacterInfoMeter";
import "./MajorIconField/MajorIconField";
import "./TagChip/TagChip";
import "./ExpandableSection/ExpandableSection";
import "./LabeledSection/LabeledSection";
import "./ItemRow/ItemRow";
// import "./SpellSlotField/SpellSlotField";
import "./TippableItem/TippableItem";

/**
 * FONTAWESOME LIB CONFIG
 * 
 * This config shouldn't effect Core's Fontawesome
 */
config.autoAddCss = false;