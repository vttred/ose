/* eslint-disable import/no-cycle, simple-import-sort/imports */

/**
 * @file Orchestration for our Quench tests
 */
import dataModelCharacterMoveTests, {
  key as dataModelCharacterMoveKey, 
  options as dataModelCharacterMoveOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-move.test";
import dataModelCharacterEncumbranceTests, {
  key as dataModelCharacterEncumbranceKey, 
  options as dataModelCharacterEncumbranceOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-encumbrance.test";
import dataModelCharacterSpellsTests, {
  key as dataModelCharacterSpellsKey,
  options as dataModelCharacterSpellsOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-spells.test";
import dataModelCharacterScoresTests, {
  key as dataModelCharacterScoresKey,
  options as dataModelCharacterScoresOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-scores.test";
import dataModelCharacterACTests, {
  key as dataModelCharacterACKey,
  options as dataModelCharacterACOptions,
} from "../module/actor/data-model-classes/__tests__/data-model-character-ac.test";
import dataModelCharacterTests, {
  key as dataModelCharacterKey,
  options as dataModelCharacterOptions,
} from '../module/actor/data-model-character.test.js';
import characterRollingTests, {
  key as characterRollingKey,
  options as characterRollingOptions,
} from './actor/character-rolling.e2e.test';
import actorCrudInventoryContainerTests, {
  key as actorCrudInventoryContainerKey,
  options as actorCrudInventoryContainerOptions,
} from '../module/actor/__tests__/character-crud-inventory-container.test';
import characterItemMacroTests, {
  key as characterItemMacroKey,
  options as characterItemMacroOptions,
} from '../module/actor/__tests__/character-macros.test';
import macroCreationTests, {
  key as macroCreationKey,
  options as macroCreationOptions,
} from '../module/__tests__/macros-creation.test';

export type QuenchMethods = {
  [s: string]: any;
};

type Quench = {
  registerBatch: (key: string, tests: Function, options: any) => void;
};

Hooks.on('quenchReady', async (quench: Quench) => {
  // Macro testing
  quench.registerBatch(
    macroCreationKey,
    macroCreationTests,
    macroCreationOptions
  );
  quench.registerBatch(
    characterItemMacroKey,
    characterItemMacroTests,
    characterItemMacroOptions
  );
  // Actor CRUD testing
  quench.registerBatch(
    actorCrudInventoryContainerKey,
    actorCrudInventoryContainerTests,
    actorCrudInventoryContainerOptions
  );
  // Actor rolling testing
  quench.registerBatch(
    characterRollingKey,
    characterRollingTests,
    characterRollingOptions
  );
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
});
