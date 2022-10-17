import { QuenchMethods } from "../../../e2e";
import OseDataModelCharacterSpells from "./data-model-character-spells";

export const key = 'ose.datamodel.character.spells';
export const options = { displayName: 'Character Data Model: Spells' }

export default ({
  describe,
  it,
  expect
}: QuenchMethods) => {
  // Core goes to 6, but we'll go to 9 just in case
  // someone wants to implement higher-level spells
  const spellsPerLevel = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  
  const createMockSpell = (lvl: number, options?: any): Item => new Item.implementation({
    name: `Mock Spell ${foundry.utils.randomID()}`,
    type: 'spell',
    system: {...options, lvl}
  }) as Item;

  const createMockSpellList = (options: any, ...levels: any) =>
    levels.reduce(
      (arr: Item[], lvCount: number, idx: number) => [
          ...arr, 
          ...Array.from(
            new Array(lvCount),
            () => createMockSpell(idx+1, options)
          )
        ], []
    );
  
  // Test for spells being sorted into buckets by spell level.
  describe('Spell levels', () => {
    it('Sorts the incoming spell list into an object with spell level keys', () => {
      const spells = createMockSpellList({}, ...spellsPerLevel);
      const spellData = new OseDataModelCharacterSpells({}, spells)
      spellsPerLevel.forEach(lv => {
        expect(spellData.spellList[lv].length).to.equal(lv);
      })
    })
  })
  // Test for available/max slots
  describe('Spell slots', () => {
    describe('Shows committed and max spell slots per level', () => {
      it('with no spells prepared', () => {
        const spells = [createMockSpell(1)];
        const spellData = new OseDataModelCharacterSpells({1: {max: 1}}, spells as Item[]);
        expect(spellData.slots[1].used).to.equal(0);
        expect(spellData.slots[1].max).to.equal(1);
      })
      
      it('with spells prepared, not cast', () => {
        const spells = [createMockSpell(1, {memorized: 1, cast: 1})];
        const spellData = new OseDataModelCharacterSpells({1: {max: 1}}, spells as Item[]);
        expect(spellData.slots[1].used).to.equal(1);
        expect(spellData.slots[1].max).to.equal(1);
      })
      
      it('with spells prepared and cast', () => {
        const spells = [createMockSpell(1, {memorized: 1, cast: 0})];
        const spellData = new OseDataModelCharacterSpells({1: {max: 1}}, spells as Item[]);
        expect(spellData.slots[1].used).to.equal(0);
        expect(spellData.slots[1].max).to.equal(1);
      })
    })
  })
  // Sanity check: can we cast spells?
  describe('Checking for spellcasting', () => {
    it('Can cast spells when spellcasting is enabled', () => {
      const spellData = new OseDataModelCharacterSpells({enabled: true}, []);
      expect(spellData.enabled).to.be.true;
    })
    it('Cannot cast spells when spellcasting is disabled', () => {
      const spellData = new OseDataModelCharacterSpells({enabled: false}, []);
      expect(spellData.enabled).to.be.false;
    })
    it('Can toggle between being able and unable to cast spells', () => {
      const spellData = new OseDataModelCharacterSpells({enabled: true}, []);
      expect(spellData.enabled).to.be.true;
      spellData.enabled = false;
      expect(spellData.enabled).to.be.false;
    })
  })
};