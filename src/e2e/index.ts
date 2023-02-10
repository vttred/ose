/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable import/no-cycle */
// eslint-disable-next-line prettier/prettier
/* eslint-disable simple-import-sort/imports */
/**
 * @file Orchestration for our Quench tests
 */
import actorCrudInventoryContainerTests, {
  key as actorCrudInventoryContainerKey,
  options as actorCrudInventoryContainerOptions,
} from "../module/actor/__tests__/character-crud-inventory-container.test";
import dataModelCharacterTests, {
  key as dataModelCharacterKey,
  options as dataModelCharacterOptions,
} from "../module/actor/data-model-character.test";
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
import sheetCharacterTests, {
  key as sheetCharacterKey,
  options as sheetCharacterOptions,
} from "./actor/sheet-character.e2e.test";

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
import sheetCharacterModifiersTest, {
  key as sheetCharacterModifiersKey,
  options as sheetCharacterModifiersOptions,
} from "../module/dialog/__tests__/sheet-character-modifiers.test";
import sheetEntityTweaksTests, {
  key as sheetEntityTweaksKey,
  options as sheetEntityTweaksOptions,
} from "../module/dialog/__tests__/sheet-entity-tweaks.test";
import entityPartyTests, {
  key as entityPartyKey,
  options as entityPartyOptions,
} from "../module/party/__tests__/entity-party.test";
import sheetPartyXpTests, {
  key as sheetPartyXpKey,
  options as sheetPartyXpOptions,
} from "../module/party/__tests__/sheet-party-xp.test";
import sheetPartyTests, {
  key as sheetPartyKey,
  options as sheetPartyOptions,
} from "../module/party/__tests__/sheet-party.test";

export type QuenchMethods = {
  [s: string]: any;
};

type Quench = {
  registerBatch: (key: string, tests: Function, options: any) => void;
};

Hooks.on("quenchReady", async (quench: Quench) => {
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
  quench.registerBatch(
    sheetCharacterModifiersKey,
    sheetCharacterModifiersTest,
    sheetCharacterModifiersOptions
  );
  quench.registerBatch(
    sheetEntityTweaksKey,
    sheetEntityTweaksTests,
    sheetEntityTweaksOptions
  );
  quench.registerBatch(entityPartyKey, entityPartyTests, entityPartyOptions);
  quench.registerBatch(sheetPartyKey, sheetPartyTests, sheetPartyOptions);
  quench.registerBatch(sheetPartyXpKey, sheetPartyXpTests, sheetPartyXpOptions);
  // Item model
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
  // Item Entity Testing
  quench.registerBatch(entityItemKey, entityItemTests, entityItemOptions);
  // Item Sheet testing
  quench.registerBatch(sheetItemKey, sheetItemTests, sheetItemOptions);

  // Character data model classes
  quench.registerBatch(
    dataModelCharacterKey,
    dataModelCharacterTests,
    dataModelCharacterOptions
  );
  quench.registerBatch(
    dataModelCharacterACKey,
    dataModelCharacterACTests,
    dataModelCharacterACOptions
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
    dataModelCharacterEncumbranceKey,
    dataModelCharacterEncumbranceTests,
    dataModelCharacterEncumbranceOptions
  );
  quench.registerBatch(
    dataModelCharacterMoveKey,
    dataModelCharacterMoveTests,
    dataModelCharacterMoveOptions
  );
  // Actor CRUD testing
  quench.registerBatch(
    actorCrudInventoryContainerKey,
    actorCrudInventoryContainerTests,
    actorCrudInventoryContainerOptions
  );
  // Actor rolling testing
  quench.registerBatch(
    sheetCharacterKey,
    sheetCharacterTests,
    sheetCharacterOptions
  );
});
