/* eslint-disable import/no-cycle */
/* eslint-disable simple-import-sort/imports */
/**
 * @file Orchestration for our Quench tests
 */
// ACTOR TESTING IMPORTS
import dataModelActorCharacterTests, {
  key as dataModelActorCharacterKey,
  options as dataModelActorCharacterOptions,
} from "../module/actor/__tests__/data-model-character.test";
import dataModelCharacterACTests, {
  key as dataModelCharacterACKey,
  options as dataModelCharacterACOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-ac.test";
import dataModelCharacterEncumbranceTests, {
  key as dataModelCharacterEncumbranceKey,
  options as dataModelCharacterEncumbranceOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-encumbrance.test";
import dataModelCharacterMoveTests, {
  key as dataModelCharacterMoveKey,
  options as dataModelCharacterMoveOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-move.test";
import dataModelCharacterScoresTests, {
  key as dataModelCharacterScoresKey,
  options as dataModelCharacterScoresOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-scores.test";
import dataModelCharacterSpellsTests, {
  key as dataModelCharacterSpellsKey,
  options as dataModelCharacterSpellsOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-spells.test";
import dataModelActorMonsterTests, {
  key as dataModelActorMonsterKey,
  options as dataModelActorMonsterOptions,
} from "../module/actor/__tests__/data-model-monster.test";
import entityActorTests, {
  key as entityActorKey,
  options as entityActorOptions,
} from "../module/actor/__tests__/entity-actor.test";
import sheetActorTests, {
  key as sheetActorKey,
  options as sheetActorOptions,
} from "../module/actor/__tests__/sheet-actor.test";
import sheetActorDragNDropTests, {
  key as sheetActorDragNDropKey,
  options as sheetActorDragNDropOptions,
} from "../module/actor/__tests__/sheet-actor/sheet-actor-e2e-dragndrop.test";
import sheetCharacterTests, {
  key as sheetCharacterKey,
  options as sheetCharacterOptions,
} from "../module/actor/__tests__/sheet-character.test";
import sheetMonsterTests, {
  key as sheetMonsterKey,
  options as sheetMonsterOptions,
} from "../module/actor/__tests__/sheet-monster.test";

// DIALOG TESTING IMPORTS
import sheetDialogCharacterModifiersTest, {
  key as sheetDialogCharacterModifiersKey,
  options as sheetDialogCharacterModifiersOptions,
} from "../module/dialog/__tests__/sheet-character-modifiers.test";
import sheetDialogEntityTweaksTests, {
  key as sheetDialogEntityTweaksKey,
  options as sheetDialogEntityTweaksOptions,
} from "../module/dialog/__tests__/sheet-entity-tweaks.test";

// ITEM TESTING IMPORTS
import dataModelItemAbilityTests, {
  key as dataModelItemAbilityKey,
  options as dataModelItemAbilityOptions,
} from "../module/item/__tests__/data-model-item-ability.test";
import dataModelItemArmorTests, {
  key as dataModelItemArmorKey,
  options as dataModelItemArmorOptions,
} from "../module/item/__tests__/data-model-item-armor.test";
import dataModelItemContainerTests, {
  key as dataModelItemContainerKey,
  options as dataModelItemContainerOptions,
} from "../module/item/__tests__/data-model-item-container.test";
import dataModelItemMiscTests, {
  key as dataModelItemMiscKey,
  options as dataModelItemMiscOptions,
} from "../module/item/__tests__/data-model-item-misc.test";
import dataModelItemSpellTests, {
  key as dataModelItemSpellKey,
  options as dataModelItemSpellOptions,
} from "../module/item/__tests__/data-model-item-spell.test";
import dataModelItemWeaponTests, {
  key as dataModelItemWeaponKey,
  options as dataModelItemWeaponOptions,
} from "../module/item/__tests__/data-model-item-weapon.test";
import entityItemTests, {
  key as entityItemKey,
  options as entityItemOptions,
} from "../module/item/__tests__/entity-item.test";
import sheetItemTests, {
  key as sheetItemKey,
  options as sheetItemOptions,
} from "../module/item/__tests__/sheet-item.test";

// PARTY TESTING IMPORTS
import entityPartyTests, {
  key as entityPartyKey,
  options as entityPartyOptions,
} from "../module/party/__tests__/entity-party.test";
import sheetPartyTests, {
  key as sheetPartyKey,
  options as sheetPartyOptions,
} from "../module/party/__tests__/sheet-party.test";
import sheetPartyXpTests, {
  key as sheetPartyXpKey,
  options as sheetPartyXpOptions,
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
    dataModelActorCharacterKey,
    dataModelActorCharacterTests,
    dataModelActorCharacterOptions
  );
  quench.registerBatch(
    dataModelCharacterACKey,
    dataModelCharacterACTests,
    dataModelCharacterACOptions
  );
  quench.registerBatch(
    dataModelCharacterEncumbranceKey,
    dataModelCharacterEncumbranceTests,
    dataModelCharacterEncumbranceOptions
  );
  quench.registerBatch(
    dataModelCharacterMoveKey,
    dataModelCharacterMoveTests,
    dataModelCharacterMoveOptions
  );
  quench.registerBatch(
    dataModelCharacterScoresKey,
    dataModelCharacterScoresTests,
    dataModelCharacterScoresOptions
  );
  quench.registerBatch(
    dataModelCharacterSpellsKey,
    dataModelCharacterSpellsTests,
    dataModelCharacterSpellsOptions
  );
  quench.registerBatch(
    dataModelActorMonsterKey,
    dataModelActorMonsterTests,
    dataModelActorMonsterOptions
  );

  quench.registerBatch(entityActorKey, entityActorTests, entityActorOptions);

  quench.registerBatch(sheetActorKey, sheetActorTests, sheetActorOptions);
  quench.registerBatch(
    sheetActorDragNDropKey,
    sheetActorDragNDropTests,
    sheetActorDragNDropOptions
  );
  quench.registerBatch(
    sheetCharacterKey,
    sheetCharacterTests,
    sheetCharacterOptions
  );
  quench.registerBatch(sheetMonsterKey, sheetMonsterTests, sheetMonsterOptions);

  /* ------------------------------------------- */
  /* DIALOG TESTING                              */
  /* ------------------------------------------- */

  quench.registerBatch(
    sheetDialogCharacterModifiersKey,
    sheetDialogCharacterModifiersTest,
    sheetDialogCharacterModifiersOptions
  );
  quench.registerBatch(
    sheetDialogEntityTweaksKey,
    sheetDialogEntityTweaksTests,
    sheetDialogEntityTweaksOptions
  );

  /* ------------------------------------------- */
  /* ITEM TESTING                                */
  /* ------------------------------------------- */

  quench.registerBatch(
    dataModelItemAbilityKey,
    dataModelItemAbilityTests,
    dataModelItemAbilityOptions
  );
  quench.registerBatch(
    dataModelItemArmorKey,
    dataModelItemArmorTests,
    dataModelItemArmorOptions
  );
  quench.registerBatch(
    dataModelItemContainerKey,
    dataModelItemContainerTests,
    dataModelItemContainerOptions
  );
  quench.registerBatch(
    dataModelItemMiscKey,
    dataModelItemMiscTests,
    dataModelItemMiscOptions
  );
  quench.registerBatch(
    dataModelItemSpellKey,
    dataModelItemSpellTests,
    dataModelItemSpellOptions
  );
  quench.registerBatch(
    dataModelItemWeaponKey,
    dataModelItemWeaponTests,
    dataModelItemWeaponOptions
  );

  quench.registerBatch(entityItemKey, entityItemTests, entityItemOptions);

  quench.registerBatch(sheetItemKey, sheetItemTests, sheetItemOptions);

  /* ------------------------------------------- */
  /* PARTY TESTING                         */
  /* ------------------------------------------- */

  quench.registerBatch(entityPartyKey, entityPartyTests, entityPartyOptions);
  quench.registerBatch(sheetPartyKey, sheetPartyTests, sheetPartyOptions);
  quench.registerBatch(sheetPartyXpKey, sheetPartyXpTests, sheetPartyXpOptions);

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
