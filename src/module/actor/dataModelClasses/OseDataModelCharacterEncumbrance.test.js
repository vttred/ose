import OseDataModelCharacterEncumbrance from "./OseDataModelCharacterEncumbrance";

export const key = 'ose.datamodel.character.encumbrance';
export const options = { displayName: 'Character Data Model: Encumbrance'}

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
  // For each encumbrance variant (disabled, basic, detailed, complete)
    // Test for encumbrance steps
    // Test for current encumbrance total
      // As value
      // As percentage
      // As boolean -- "are we fully encumbered?"
    // Test for maximum carry weight
    // Test for the heaviest equipped armor
  
  describe('Disabled Encumbrance', () => {
    it('Is disabled', () => {
      const enc = new OseDataModelCharacterEncumbrance();
      expect(enc.enabled).to.be.false;
    })
  })
  
  describe('Basic Encumbrance', () => {
    it('Is enabled', () => {
      const enc = new OseDataModelCharacterEncumbrance('basic');
      expect(enc.enabled).to.be.true;
    })
    it('Returns the appropriate encumbrance steps', () => {
      const enc = new OseDataModelCharacterEncumbrance('basic');
      const step = game.settings.get(game.system.id, 'significantTreasure');
      const expectedSteps = [(100 * step) / enc.max];
      expect(enc.steps).to.have.members(expectedSteps)
    })
    describe('Returns current carried weight', () => {
      it('As Percentage', () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;
        const toPct = (value) => Math.clamped((100 * value) / max, 0, 100); 
        
        let enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', pct25, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct25));
        
        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', pct50, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct50));
        
        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', pct75, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct75));
        
        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', max, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(100);
        
        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', max, 1, {treasure: false})]
        );
        expect(enc.pct).to.equal(0);
      })
      it('As Value', () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;
        
        let enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', pct25, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(pct25);
        
        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', pct50, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(pct50);
        
        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', pct75, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(pct75);
        
        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', max, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(max);
        
        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', max, 1, {treasure: false})]
        );
        expect(enc.value).to.equal(0);
      
      })
      describe('As fully encumbered flag', () => {
        it('Encumbered at full load', () => {
          const enc = new OseDataModelCharacterEncumbrance(
            'basic', 
            1600,
            [createMockItem('item', 1600, 1, {treasure: true})]
          );
          expect(enc.encumbered).to.be.true;
        })
        describe('Not encumbered', () => {
          it('from non-treasure items', () => {
            const enc = new OseDataModelCharacterEncumbrance(
              'basic', 
              1600,
              [
                createMockItem('weapon', 1600, 1),
                createMockItem('armor', 1600, 1),
                createMockItem('container', 1600, 1),
                createMockItem('item', 1600, 1)
              ]
            );
            expect(enc.encumbered).to.be.false;
          })
          it('from a partial load', () => {
            const enc = new OseDataModelCharacterEncumbrance(
              'basic', 
              1600,
              [createMockItem('item', 400, 1, {treasure: true})]
            );
            expect(enc.encumbered).to.be.false;
          })
        })
      });
    })
    it('Returns max carry weight', () => {
      const setMax = 2000;
      
      let enc = new OseDataModelCharacterEncumbrance('basic', setMax);
      expect(enc.max).to.equal(setMax);
      
      enc = new OseDataModelCharacterEncumbrance('basic');
      expect(enc.max).to.equal(OseDataModelCharacterEncumbrance.encumbranceCap);
    })
    describe('Sets the appropriate weight class for worn armor', () => {
      let unarmored = createMockItem('armor', 0, 1)
      let light = createMockItem('armor', 0, 1, {type: 'light'})
      let heavy = createMockItem('armor', 0, 1, {type: 'heavy'})
      
      let enc = new OseDataModelCharacterEncumbrance('basic', null, [unarmored]);
      expect(enc.heaviestArmor).toEqual(OseDataModelCharacterEncumbrance.basicArmorWeight.unarmored);
      
      enc = new OseDataModelCharacterEncumbrance('basic', null, [light]);
      expect(enc.heaviestArmor).toEqual(OseDataModelCharacterEncumbrance.basicArmorWeight.light);
      
      enc = new OseDataModelCharacterEncumbrance('basic', null, [heavy]);
      expect(enc.heaviestArmor).toEqual(OseDataModelCharacterEncumbrance.basicArmorWeight.heavy);
    })
  })
  describe('Detailed Encumbrance', () => {
    it('Is enabled', () => {
      const enc = new OseDataModelCharacterEncumbrance('detailed');
      expect(enc.enabled).to.be.true;
    })
    describe('Returns the appropriate encumbrance steps', () => {})
    describe('Returns current carried weight', () => {
      describe('As Percentage', () => {
        
      })
      describe('As Value', () => {
      
      })
      describe('As fully encumbered flag', () => {
      
      });
    })
    describe('Returns max carry weight', () => {})
  })
  describe('Complete Encumbrance', () => {
    it('Is enabled', () => {
      const enc = new OseDataModelCharacterEncumbrance('complete');
      expect(enc.enabled).to.be.true;
    })
    describe('Recognizes being over carry limit', () => {})
    describe('Returns the appropriate encumbrance steps', () => {})
    describe('Returns current carried weight', () => {
      describe('As Percentage', () => {
        
      })
      describe('As Value', () => {
      
      })
      describe('As fully encumbered flag', () => {
      
      });
    })
    describe('Returns max carry weight', () => {})
  })
  
}