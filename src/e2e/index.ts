/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable import/no-cycle, simple-import-sort/imports */

/**
 * @file Orchestration for our Quench tests
 */
import characterItemMacroTests, {
  key as characterItemMacroKey,
  options as characterItemMacroOptions,
} from "../module/actor/__tests__/character-macros.test";
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
import macroCreationTests, {
  key as macroCreationKey,
  options as macroCreationOptions,
} from "../module/__tests__/macros-creation.test";
import entityItemTests, {
  key as entityItemKey,
  options as entityItemOptions,
} from "../module/item/__tests__/entity-item.tests";
import dataModelItemArmorTests, {
  key as dataModelItemArmorKey,
  options as dataModelItemArmorOptions,
} from "../module/item/__tests__/data-model-item-armor.tests";
import dataModelItemAbilityTests, {
  key as dataModelItemAbilityKey,
  options as dataModelItemAbilityOptions,
} from "../module/item/__tests__/data-model-item-ability.tests";
import dataModelItemContainerTests, {
  key as dataModelItemContainerKey,
  options as dataModelItemContainerOptions,
} from "../module/item/__tests__/data-model-item-container.tests";
import dataModelItemMiscTests, {
  key as dataModelItemMiscKey,
  options as dataModelItemMiscOptions,
} from "../module/item/__tests__/data-model-item-misc.tests";
import dataModelItemSpellTests, {
  key as dataModelItemSpellKey,
  options as dataModelItemSpellOptions,
} from "../module/item/__tests__/data-model-item-spell.tests";
import dataModelItemWeaponTests, {
  key as dataModelItemWeaponKey,
  options as dataModelItemWeaponOptions,
} from "../module/item/__tests__/data-model-item-weapon.tests";
import sheetItemTests, {
  key as sheetItemKey,
  options as sheetItemOptions,
} from "../module/item/__tests__/sheet-item.tests";

export type QuenchMethods = {
  [s: string]: any;
};

type Quench = {
  registerBatch: (key: string, tests: Function, options: any) => void;
};

Hooks.on("quenchReady", async (quench: Quench) => {
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
    characterItemMacroKey,
    characterItemMacroTests,
    characterItemMacroOptions
  );
  // Actor rolling testing
  quench.registerBatch(
    sheetCharacterKey,
    sheetCharacterTests,
    sheetCharacterOptions
  );
  // Macro testing
  quench.registerBatch(
    macroCreationKey,
    macroCreationTests,
    macroCreationOptions
  );
});
