import characterTests, {
  key as characterKey,
  options as characterOptions
} from './actor/character.e2e.test.js';

import dataModelCharacterACTests, {
  key as dataModelCharacterACKey,
  options as dataModelCharacterACOptions
} from '../module/actor/dataModelClasses/OseDataModelCharacterAC.test.js';

import dataModelCharacterScoresTests, {
  key as dataModelCharacterScoresKey,
  options as dataModelCharacterScoresOptions
} from '../module/actor/dataModelClasses/OseDataModelCharacterScores.test.js';

// @TODO Tests for OseDataModelCharacter* classes

Hooks.on('quenchReady', async (quench) => {
  quench.registerBatch(characterKey, characterTests, characterOptions)
  // Character data model classes
  quench.registerBatch(dataModelCharacterACKey, dataModelCharacterACTests, dataModelCharacterACOptions);
  quench.registerBatch(dataModelCharacterScoresKey, dataModelCharacterScoresTests, dataModelCharacterScoresOptions);
});