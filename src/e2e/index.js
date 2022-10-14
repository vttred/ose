import characterTests, {
  key as characterKey,
  options as characterOptions
} from './actor/character.e2e.test.js';

// @TODO Tests for OseDataModelCharacter* classes

Hooks.on('quenchReady', async (quench) => {
  quench.registerBatch(characterKey, characterTests, characterOptions);
});