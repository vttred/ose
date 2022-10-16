import OseDataModelCharacterMove from "./OseDataModelCharacterMove";
import OseDataModelCharacterEncumbrance from "./OseDataModelCharacterEncumbrance";

export const key = 'ose.datamodel.character.move';
export const options = { displayName: 'Character Data Model: Movement'}

export default ({
  before,
  beforeEach,
  after,
  describe,
  it,
  expect,
  ...context
}) => {
  const createMockItem = (type, weight, quantity, options = {}) => new Item.implementation({
    name: `Mock ${type} ${foundry.utils.randomID()}`,
    type,
    system: {...options, weight, quantity: {value: quantity}}
  });
  
  // Test for disabled autocalculation
  // For each encumbrance type...
    // For each overburdened step...
      // Test base move speed
      // Test overland move speed
      // Test encounter move speed
  
  describe('Prevent autocalculation when...', () => { 
    it('Autocalculation is off', ()  => {
      let enc = new OseDataModelCharacterEncumbrance('basic');
      let move = new OseDataModelCharacterMove(enc, false);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate)
    })
    it('Encumbrance is disabled', () => {
      let enc = new OseDataModelCharacterEncumbrance('disabled');
      let move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate)
    })
  })
  
  describe('Correctly calculates from Basic Encumbrance', () => {
    it('While unarmored', () => {
      let enc = new OseDataModelCharacterEncumbrance('basic');
      let move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate)

      enc = new OseDataModelCharacterEncumbrance('basic', undefined, [
        createMockItem('armor', 100, 1, {type: 'unarmored', equipped: true}),
        createMockItem('armor', 100, 1, {type: 'light', equipped: false}),
        createMockItem('armor', 100, 1, {type: 'heavy', equipped: false})
      ]);
      move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate)
    })
    it('While lightly armored', () => {
      const enc = new OseDataModelCharacterEncumbrance('basic', undefined, [
        createMockItem('armor', 100, 1, {type: 'unarmored', equipped: false}),
        createMockItem('armor', 100, 1, {type: 'light', equipped: true}),
        createMockItem('armor', 100, 1, {type: 'heavy', equipped: false})
      ]);
      const move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate * .75)
    })
    it('While heavily armored', () => {
      const enc = new OseDataModelCharacterEncumbrance('basic', undefined, [
        createMockItem('armor', 100, 1, {type: 'unarmored', equipped: false}),
        createMockItem('armor', 100, 1, {type: 'light', equipped: false}),
        createMockItem('armor', 100, 1, {type: 'heavy', equipped: true})
      ]);
      const move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate * .5)
    })
    it('While carrying a significant amount of treasure', () => {
      let enc = new OseDataModelCharacterEncumbrance('basic', undefined, [
        createMockItem('item', OseDataModelCharacterEncumbrance.basicSignificantTreasure - 1, 1, {treasure: true}),
      ]);
      let move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate)

      enc = new OseDataModelCharacterEncumbrance('basic', undefined, [
        createMockItem('item', OseDataModelCharacterEncumbrance.basicSignificantTreasure, 1, {treasure: true}),
      ]);
      move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate - 30)
    })
  })
  describe('Correctly calculates from Detailed Encumbrance', () => {
    
  })
  describe('Correctly calculates from Complete Encumbrance', () => {
    
  })
}