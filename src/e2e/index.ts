/**
 * @file Orchestration for our Quench tests
 */
import actorCrudInventoryContainerTests, {
  key as actorCrudInventoryContainerKey,
  options as actorCrudInventoryContainerOptions
} from '../module/actor/__tests__/character-crud-inventory-container.test';

import macroTests, {
  key as macroKey,
  options as macroOptions
} from '../module/__tests__/macros.test';

import characterItemMacroTests, {
  key as characterItemMacroKey,
  options as characterItemMacroOptions
} from '../module/actor/__tests__/character-macros.test';

import characterTests, {
  key as characterKey,
  options as characterOptions
} from './actor/character.e2e.test.js';

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
import characterTests, {
  key as characterKey,
  options as characterOptions,
} from "./actor/character.e2e.test.js";
import characterItemMacroTests, {
  key as characterItemMacroKey,
  options as characterItemMacroOptions,
} from "./actor/createItemMacro.test";
import dataModelCharacterTests, {
  key as dataModelCharacterKey,
  options as dataModelCharacterOptions
} from '../module/actor/data-model-character.test.js';

export type QuenchMethods = {
  [s: string]: any;
};

type Quench = {
  registerBatch: (key: string, tests: Function, options: any) => void;
};

Hooks.on('quenchReady', async (quench: Quench) => {
  quench.registerBatch(actorCrudInventoryContainerKey, actorCrudInventoryContainerTests, actorCrudInventoryContainerOptions);
  quench.registerBatch(macroKey, macroTests, macroOptions);
  quench.registerBatch(characterItemMacroKey, characterItemMacroTests, characterItemMacroOptions);
  quench.registerBatch(characterKey, characterTests, characterOptions);
  // Character data model classes
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
  quench.registerBatch(
    dataModelCharacterKey,
    dataModelCharacterTests,
    dataModelCharacterOptions
  );
});
