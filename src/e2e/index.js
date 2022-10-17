import characterTests, {
  key as characterKey,
  options as characterOptions
} from './actor/character.e2e.test.js';

import dataModelCharacterACTests, {
  key as dataModelCharacterACKey,
  options as dataModelCharacterACOptions
} from '../module/actor/data-model-classes/data-model-character-ac.test.js';

import dataModelCharacterScoresTests, {
  key as dataModelCharacterScoresKey,
  options as dataModelCharacterScoresOptions
} from '../module/actor/data-model-classes/data-model-character-scores.test.js';

import dataModelCharacterSpellsTests, {
  key as dataModelCharacterSpellsKey,
  options as dataModelCharacterSpellsOptions
} from '../module/actor/data-model-classes/data-model-character-spells.test.js';

import dataModelCharacterEncumbranceTests, {
  key as dataModelCharacterEncumbranceKey,
  options as dataModelCharacterEncumbranceOptions
} from '../module/actor/data-model-classes/data-model-character-encumbrance.test.js';

import dataModelCharacterMoveTests, {
  key as dataModelCharacterMoveKey,
  options as dataModelCharacterMoveOptions
} from '../module/actor/data-model-classes/data-model-character-move.test.js';

import dataModelCharacterTests, {
  key as dataModelCharacterKey,
  options as dataModelCharacterOptions
} from '../module/actor/data-model-character.test.js';

// @TODO Tests for OseDataModelCharacter* classes

Hooks.on('quenchReady', async (quench) => {
  quench.registerBatch(characterKey, characterTests, characterOptions)
  // Character data model classes
  quench.registerBatch(dataModelCharacterACKey, dataModelCharacterACTests, dataModelCharacterACOptions);
  quench.registerBatch(dataModelCharacterScoresKey, dataModelCharacterScoresTests, dataModelCharacterScoresOptions);
  quench.registerBatch(dataModelCharacterSpellsKey, dataModelCharacterSpellsTests, dataModelCharacterSpellsOptions);
  quench.registerBatch(dataModelCharacterEncumbranceKey, dataModelCharacterEncumbranceTests, dataModelCharacterEncumbranceOptions);
  quench.registerBatch(dataModelCharacterMoveKey, dataModelCharacterMoveTests, dataModelCharacterMoveOptions);
  quench.registerBatch(dataModelCharacterKey, dataModelCharacterTests, dataModelCharacterOptions);
});