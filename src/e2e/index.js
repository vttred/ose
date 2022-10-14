import characterTests, {
  key as characterKey,
  options as characterOptions
} from './actor/character.e2e.test.js';

import dataModelCharacterACTests, {
  key as dataModelCharacterACKey,
  options as dataModelCharacterACOptions
} from '../module/actor/dataModelClasses/OseDataModelCharacterAC.test.js';

// @TODO Tests for OseDataModelCharacter* classes

Hooks.on('quenchReady', async (quench) => {
  quench.registerBatch(characterKey, characterTests, characterOptions)
  quench.registerBatch(dataModelCharacterACKey, dataModelCharacterACTests, dataModelCharacterACOptions);
});