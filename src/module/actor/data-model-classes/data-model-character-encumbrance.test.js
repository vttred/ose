import OseDataModelCharacterEncumbrance from "./data-model-character-encumbrance";

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
  const toPct = (value, max) => Math.clamped((100 * value) / max, 0, 100); 
  const createMockItem = (type, weight, quantity, options = {}) => new Item.implementation({
    name: `Mock ${type} ${foundry.utils.randomID()}`,
    type,
    system: {...options, weight, quantity: {value: quantity}}
  });
  
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
        
        let enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', pct25, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct25, max));
        
        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', pct50, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct50, max));
        
        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          max,
          [createMockItem('item', pct75, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct75, max));
        
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
      })
      it('As "over significant treasure threshold" flag', () => {
        let enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          1600,
          [createMockItem('item', 400, 1, {treasure: true})]
        );
        expect(enc.overSignificantTreasureThreshold).to.be.false;

        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          1600,
          [createMockItem('item', 800, 1, {treasure: true})]
        );
        expect(enc.overSignificantTreasureThreshold).to.be.true;

        enc = new OseDataModelCharacterEncumbrance(
          'basic', 
          1600,
          [createMockItem('weapon', 800, 1)]
        );
        expect(enc.overSignificantTreasureThreshold).to.be.false;
      });
    });
    
    it('Returns max carry weight', () => {
      const setMax = 2000;
      
      let enc = new OseDataModelCharacterEncumbrance('basic', setMax);
      expect(enc.max).to.equal(setMax);
      
      enc = new OseDataModelCharacterEncumbrance('basic');
      expect(enc.max).to.equal(OseDataModelCharacterEncumbrance.encumbranceCap);
    });
    
    it('Sets the appropriate weight class for worn armor', () => {
      let unarmored = createMockItem('armor', 0, 1, {type: 'unarmored', equipped: true})
      let light = createMockItem('armor', 0, 1, {type: 'light', equipped: true})
      let heavy = createMockItem('armor', 0, 1, {type: 'heavy', equipped: true})
      let lightUnequipped = createMockItem('armor', 0, 1, {type: 'light', equipped: false})
      let heavyUnequipped = createMockItem('armor', 0, 1, {type: 'heavy', equipped: false})
      
      let enc = new OseDataModelCharacterEncumbrance('basic', null, [unarmored]);
      expect(enc.heaviestArmor).to.equal(OseDataModelCharacterEncumbrance.basicArmorWeight.unarmored);
      
      enc = new OseDataModelCharacterEncumbrance('basic', null, [light]);
      expect(enc.heaviestArmor).to.equal(OseDataModelCharacterEncumbrance.basicArmorWeight.light);
      
      enc = new OseDataModelCharacterEncumbrance('basic', null, [heavy]);
      expect(enc.heaviestArmor).to.equal(OseDataModelCharacterEncumbrance.basicArmorWeight.heavy);

      enc = new OseDataModelCharacterEncumbrance('basic', null, [lightUnequipped]);
      expect(enc.heaviestArmor).to.equal(OseDataModelCharacterEncumbrance.basicArmorWeight.unarmored);
      
      enc = new OseDataModelCharacterEncumbrance('basic', null, [light, heavyUnequipped]);
      expect(enc.heaviestArmor).to.equal(OseDataModelCharacterEncumbrance.basicArmorWeight.light);
    })
  })
  
  describe('Detailed Encumbrance', () => {
    it('Is enabled', () => {
      const enc = new OseDataModelCharacterEncumbrance('detailed');
      expect(enc.enabled).to.be.true;
    })
    it('Returns the appropriate encumbrance steps', () => {
      const enc = new OseDataModelCharacterEncumbrance('detailed');
      expect(enc.steps).to.have.members(
        OseDataModelCharacterEncumbrance.encumbranceSteps
      )
    })
    describe('Returns current carried weight', () => {
      it('As Percentage', () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;
        
        let enc = new OseDataModelCharacterEncumbrance(
          'detailed', 
          max,
          [createMockItem('item', pct25, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct25, max));
        
        enc = new OseDataModelCharacterEncumbrance(
          'detailed', 
          max,
          [createMockItem('item', pct50, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct50, max));
        
        enc = new OseDataModelCharacterEncumbrance(
          'detailed', 
          max,
          [createMockItem('item', pct75, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct75, max));
        
        enc = new OseDataModelCharacterEncumbrance(
          'detailed', 
          max,
          [createMockItem('item', max, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(100);
        
        enc = new OseDataModelCharacterEncumbrance(
          'detailed', 
          max,
          [createMockItem('item', max, 1, {treasure: false})]
        );
        expect(enc.pct).to.equal(toPct(
          OseDataModelCharacterEncumbrance.detailedGearWeight,
          max
        ));
      })
      it('As Value', () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;
        
        let enc = new OseDataModelCharacterEncumbrance(
          'detailed', 
          max,
          [createMockItem('item', pct25, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(pct25);
        
        enc = new OseDataModelCharacterEncumbrance(
          'detailed', 
          max,
          [createMockItem('item', pct50, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(pct50);
        
        enc = new OseDataModelCharacterEncumbrance(
          'detailed', 
          max,
          [createMockItem('item', pct75, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(pct75);
        
        enc = new OseDataModelCharacterEncumbrance(
          'detailed', 
          max,
          [createMockItem('item', max, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(max);
        
        enc = new OseDataModelCharacterEncumbrance(
          'detailed', 
          max,
          [createMockItem('item', max, 1, {treasure: false})]
        );
        expect(enc.value).to.equal(
          OseDataModelCharacterEncumbrance.detailedGearWeight,
        );
      
      })
      describe('As fully encumbered flag', () => {
        it('Encumbered at full load', () => {
          const enc = new OseDataModelCharacterEncumbrance(
            'detailed', 
            1600,
            [createMockItem('item', 1600, 1, {treasure: true})]
          );
          expect(enc.encumbered).to.be.true;
        })
        describe('Not encumbered', () => {
          it('from non-treasure items', () => {
            const enc = new OseDataModelCharacterEncumbrance(
              'detailed', 
              1600,
              [
                createMockItem('item', 1600, 1)
              ]
            );
            expect(enc.encumbered).to.be.false;
            expect(enc.value).to.equal(80);
          })
          it('from a partial load', () => {
            const enc = new OseDataModelCharacterEncumbrance(
              'detailed', 
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
      
      let enc = new OseDataModelCharacterEncumbrance('detailed', setMax);
      expect(enc.max).to.equal(setMax);
      
      enc = new OseDataModelCharacterEncumbrance('detailed');
      expect(enc.max).to.equal(OseDataModelCharacterEncumbrance.encumbranceCap);
    });
  })

  describe('Complete Encumbrance', () => {
    it('Is enabled', () => {
      const enc = new OseDataModelCharacterEncumbrance('complete');
      expect(enc.enabled).to.be.true;
    })
    it('Returns the appropriate encumbrance steps', () => {
      const enc = new OseDataModelCharacterEncumbrance('complete');
      expect(enc.steps).to.have.members(
        OseDataModelCharacterEncumbrance.encumbranceSteps
      )
    })
    describe('Returns current carried weight', () => {
      it('As Percentage', () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;
        
        let enc = new OseDataModelCharacterEncumbrance(
          'complete', 
          max,
          [createMockItem('item', pct25, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct25, max));
        
        enc = new OseDataModelCharacterEncumbrance(
          'complete', 
          max,
          [createMockItem('item', pct50, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct50, max));
        
        enc = new OseDataModelCharacterEncumbrance(
          'complete', 
          max,
          [createMockItem('item', pct75, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(toPct(pct75, max));
        
        enc = new OseDataModelCharacterEncumbrance(
          'complete', 
          max,
          [createMockItem('item', max, 1, {treasure: true})]
        );
        expect(enc.pct).to.equal(100);
        
        enc = new OseDataModelCharacterEncumbrance(
          'complete', 
          max,
          [createMockItem('item', max, 1, {treasure: false})]
        );
        expect(enc.pct).to.equal(100);
      })
      it('As Value', () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;
        
        let enc = new OseDataModelCharacterEncumbrance(
          'complete', 
          max,
          [createMockItem('item', pct25, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(pct25);
        
        enc = new OseDataModelCharacterEncumbrance(
          'complete', 
          max,
          [createMockItem('item', pct50, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(pct50);
        
        enc = new OseDataModelCharacterEncumbrance(
          'complete', 
          max,
          [createMockItem('item', pct75, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(pct75);
        
        enc = new OseDataModelCharacterEncumbrance(
          'complete', 
          max,
          [createMockItem('item', max, 1, {treasure: true})]
        );
        expect(enc.value).to.equal(max);
        
        enc = new OseDataModelCharacterEncumbrance(
          'complete', 
          max,
          [createMockItem('item', max, 1, {treasure: false})]
        );
        expect(enc.value).to.equal(max);
      
      })
      describe('As fully encumbered flag', () => {
        it('Encumbered at full load', () => {
          let enc = new OseDataModelCharacterEncumbrance(
            'complete', 
            1600,
            [createMockItem('item', 1600, 1, {treasure: true})]
          );
          expect(enc.encumbered).to.be.true;
          enc = new OseDataModelCharacterEncumbrance(
            'complete', 
            1600,
            [createMockItem('item', 1600, 1, {treasure: false})]
          );
          expect(enc.encumbered).to.be.true;
        })
        describe('Not encumbered', () => {
          it('from a partial load', () => {
            const enc = new OseDataModelCharacterEncumbrance(
              'complete', 
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
      
      let enc = new OseDataModelCharacterEncumbrance('complete', setMax);
      expect(enc.max).to.equal(setMax);
      
      enc = new OseDataModelCharacterEncumbrance('complete');
      expect(enc.max).to.equal(OseDataModelCharacterEncumbrance.encumbranceCap);
    });
  })
  
  // describe('Complete Encumbrance', () => {
  //   it('Is enabled', () => {
  //     const enc = new OseDataModelCharacterEncumbrance('complete');
  //     expect(enc.enabled).to.be.true;
  //   })
  //   describe('Recognizes being over carry limit', () => {})
  //   describe('Returns the appropriate encumbrance steps', () => {})
  //   describe('Returns current carried weight', () => {
  //     describe('As Percentage', () => {
        
  //     })
  //     describe('As Value', () => {
      
  //     })
  //     describe('As fully encumbered flag', () => {
      
  //     });
  //   })
  //   describe('Returns max carry weight', () => {})
  // })
  
}