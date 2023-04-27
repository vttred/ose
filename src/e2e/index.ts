/* eslint-disable import/no-cycle */
/* eslint-disable simple-import-sort/imports */
/**
 * @file Orchestration for our Quench tests
 */
// ACTOR TESTING IMPORTS
import actorDataModelCharacterTests, {
  key as actorDataModelCharacterKey,
  options as actorDataModelCharacterOptions,
} from "../module/actor/__tests__/data-model-character.test";
import actorDataModelCharacterACTests, {
  key as actorDataModelCharacterACKey,
  options as actorDataModelCharacterACOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-ac.test";
import actorDataModelCharacterEncumbranceTests, {
  key as actorDataModelCharacterEncumbranceKey,
  options as actorDataModelCharacterEncumbranceOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-encumbrance.test";
import actorDataModelCharacterMoveTests, {
  key as actorDataModelCharacterMoveKey,
  options as actorDataModelCharacterMoveOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-move.test";
import actorDataModelCharacterScoresTests, {
  key as actorDataModelCharacterScoresKey,
  options as actorDataModelCharacterScoresOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-scores.test";
import actorDataModelCharacterSpellsTests, {
  key as actorDataModelCharacterSpellsKey,
  options as actorDataModelCharacterSpellsOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-spells.test";
import actorDataModelMonsterTests, {
  key as actorDataModelMonsterKey,
  options as actorDataModelMonsterOptions,
} from "../module/actor/__tests__/data-model-monster.test";
import actorEntityTests, {
  key as actorEntityKey,
  options as actorEntityOptions,
} from "../module/actor/__tests__/entity-actor.test";
import actorSheetTests, {
  key as actorSheetKey,
  options as actorSheetOptions,
} from "../module/actor/__tests__/sheet-actor.test";
import actorSheetDragNDropTests, {
  key as actorSheetDragNDropKey,
  options as actorSheetDragNDropOptions,
} from "../module/actor/__tests__/sheet-actor/sheet-actor-e2e-dragndrop.test";
import actorSheetCharacterTests, {
  key as actorSheetCharacterKey,
  options as actorSheetCharacterOptions,
} from "../module/actor/__tests__/sheet-character.test";
import actorSheetMonsterTests, {
  key as actorSheetMonsterKey,
  options as actorSheetMonsterOptions,
} from "../module/actor/__tests__/sheet-monster.test";

// DIALOG TESTING IMPORTS
import actorSheetCharacterDialogModifiersTest, {
  key as actorSheetCharacterDialogModifiersKey,
  options as actorSheetCharacterDialogModifiersOptions,
} from "../module/dialog/__tests__/sheet-character-modifiers.test";
import actorSheetDialogEntityTweaksTests, {
  key as actorSheetDialogEntityTweaksKey,
  options as actorSheetDialogEntityTweaksOptions,
} from "../module/dialog/__tests__/sheet-entity-tweaks.test";

// ITEM TESTING IMPORTS
import itemDataModelAbilityTests, {
  key as itemDataModelAbilityKey,
  options as itemDataModelAbilityOptions,
} from "../module/item/__tests__/data-model-item-ability.test";
import itemDataModelArmorTests, {
  key as itemDataModelArmorKey,
  options as itemDataModelArmorOptions,
} from "../module/item/__tests__/data-model-item-armor.test";
import itemDataModelContainerTests, {
  key as itemDataModelContainerKey,
  options as itemDataModelContainerOptions,
} from "../module/item/__tests__/data-model-item-container.test";
import itemDataModelMiscTests, {
  key as itemDataModelMiscKey,
  options as itemDataModelMiscOptions,
} from "../module/item/__tests__/data-model-item-misc.test";
import itemDataModelSpellTests, {
  key as itemDataModelSpellKey,
  options as itemDataModelSpellOptions,
} from "../module/item/__tests__/data-model-item-spell.test";
import itemDataModelWeaponTests, {
  key as itemDataModelWeaponKey,
  options as itemDataModelWeaponOptions,
} from "../module/item/__tests__/data-model-item-weapon.test";
import itemEntityTests, {
  key as itemEntityKey,
  options as itemEntityOptions,
} from "../module/item/__tests__/entity-item.test";
import itemSheetTests, {
  key as itemSheetKey,
  options as itemSheetOptions,
} from "../module/item/__tests__/sheet-item.test";

// PARTY TESTING IMPORTS
import partyEntityTests, {
  key as partyEntityKey,
  options as partyEntityOptions,
} from "../module/party/__tests__/entity-party.test";
import partySheetTests, {
  key as partySheetKey,
  options as partySheetOptions,
} from "../module/party/__tests__/sheet-party.test";
import partyXpSheetTests, {
  key as partyXpSheetKey,
  options as partyXpSheetOptions,
} from "../module/party/__tests__/sheet-party-xp.test";

// HELPER TESTING IMPORTS
import helpersBehaviourTests, {
  key as helpersBehaviourKey,
  options as helpersBehaviourOptions,
} from "../module/__tests__/helpers-behaviour.test";
import helpersChatTests, {
  key as helpersChatKey,
  options as helpersChatOptions,
} from "../module/__tests__/helpers-chat.test";
import helpersDiceTests, {
  key as helpersDiceKey,
  options as helpersDiceOptions,
} from "../module/__tests__/helpers-dice.test";
import helpersHandlebarsTests, {
  key as helpersHandlebarsKey,
  options as helpersHandlebarsOptions,
} from "../module/__tests__/helpers-handlebars.test";
import helpersMacrosTests, {
  key as helpersMacrosKey,
  options as helpersMacrosOptions,
} from "../module/__tests__/helpers-macros.test";
import helpersPartyTests, {
  key as helpersPartyKey,
  options as helpersPartyOptions,
} from "../module/__tests__/helpers-party.test";
import helpersTreasureTests, {
  key as helpersTreasureKey,
  options as helpersTreasureOptions,
} from "../module/__tests__/helpers-treasure.test";

export type QuenchMethods = {
  [s: string]: any;
};

type Quench = {
  registerBatch: (key: string, tests: Function, options: any) => void;
};

Hooks.on("quenchReady", async (quench: Quench) => {
  /* ------------------------------------------- */
  /* ACTOR TESTING                               */
  /* ------------------------------------------- */
  quench.registerBatch(
    actorDataModelCharacterKey,
    actorDataModelCharacterTests,
    actorDataModelCharacterOptions
  );
  quench.registerBatch(
    actorDataModelCharacterACKey,
    actorDataModelCharacterACTests,
    actorDataModelCharacterACOptions
  );
  quench.registerBatch(
    actorDataModelCharacterEncumbranceKey,
    actorDataModelCharacterEncumbranceTests,
    actorDataModelCharacterEncumbranceOptions
  );
  quench.registerBatch(
    actorDataModelCharacterMoveKey,
    actorDataModelCharacterMoveTests,
    actorDataModelCharacterMoveOptions
  );
  quench.registerBatch(
    actorDataModelCharacterScoresKey,
    actorDataModelCharacterScoresTests,
    actorDataModelCharacterScoresOptions
  );
  quench.registerBatch(
    actorDataModelCharacterSpellsKey,
    actorDataModelCharacterSpellsTests,
    actorDataModelCharacterSpellsOptions
  );
  quench.registerBatch(
    actorDataModelMonsterKey,
    actorDataModelMonsterTests,
    actorDataModelMonsterOptions
  );

  quench.registerBatch(actorEntityKey, actorEntityTests, actorEntityOptions);

  quench.registerBatch(actorSheetKey, actorSheetTests, actorSheetOptions);
  quench.registerBatch(
    actorSheetDragNDropKey,
    actorSheetDragNDropTests,
    actorSheetDragNDropOptions
  );
  quench.registerBatch(
    actorSheetCharacterKey,
    actorSheetCharacterTests,
    actorSheetCharacterOptions
  );
  quench.registerBatch(
    actorSheetMonsterKey,
    actorSheetMonsterTests,
    actorSheetMonsterOptions
  );

  /* ------------------------------------------- */
  /* DIALOG TESTING                              */
  /* ------------------------------------------- */

  quench.registerBatch(
    actorSheetCharacterDialogModifiersKey,
    actorSheetCharacterDialogModifiersTest,
    actorSheetCharacterDialogModifiersOptions
  );
  quench.registerBatch(
    actorSheetDialogEntityTweaksKey,
    actorSheetDialogEntityTweaksTests,
    actorSheetDialogEntityTweaksOptions
  );

  /* ------------------------------------------- */
  /* ITEM TESTING                                */
  /* ------------------------------------------- */

  quench.registerBatch(
    itemDataModelAbilityKey,
    itemDataModelAbilityTests,
    itemDataModelAbilityOptions
  );
  quench.registerBatch(
    itemDataModelArmorKey,
    itemDataModelArmorTests,
    itemDataModelArmorOptions
  );
  quench.registerBatch(
    itemDataModelContainerKey,
    itemDataModelContainerTests,
    itemDataModelContainerOptions
  );
  quench.registerBatch(
    itemDataModelMiscKey,
    itemDataModelMiscTests,
    itemDataModelMiscOptions
  );
  quench.registerBatch(
    itemDataModelSpellKey,
    itemDataModelSpellTests,
    itemDataModelSpellOptions
  );
  quench.registerBatch(
    itemDataModelWeaponKey,
    itemDataModelWeaponTests,
    itemDataModelWeaponOptions
  );

  quench.registerBatch(itemEntityKey, itemEntityTests, itemEntityOptions);

  quench.registerBatch(itemSheetKey, itemSheetTests, itemSheetOptions);

  /* ------------------------------------------- */
  /* PARTY TESTING                         */
  /* ------------------------------------------- */

  quench.registerBatch(partyEntityKey, partyEntityTests, partyEntityOptions);
  quench.registerBatch(partySheetKey, partySheetTests, partySheetOptions);
  quench.registerBatch(partyXpSheetKey, partyXpSheetTests, partyXpSheetOptions);

  /* ------------------------------------------- */
  /* HELPER TESTING                               */
  /* ------------------------------------------- */

  quench.registerBatch(
    helpersBehaviourKey,
    helpersBehaviourTests,
    helpersBehaviourOptions
  );
  quench.registerBatch(helpersChatKey, helpersChatTests, helpersChatOptions);
  quench.registerBatch(helpersDiceKey, helpersDiceTests, helpersDiceOptions);
  quench.registerBatch(
    helpersHandlebarsKey,
    helpersHandlebarsTests,
    helpersHandlebarsOptions
  );
  quench.registerBatch(
    helpersMacrosKey,
    helpersMacrosTests,
    helpersMacrosOptions
  );
  quench.registerBatch(helpersPartyKey, helpersPartyTests, helpersPartyOptions);
  quench.registerBatch(
    helpersTreasureKey,
    helpersTreasureTests,
    helpersTreasureOptions
  );
});