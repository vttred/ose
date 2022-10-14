import OseDataModelCharacterAC from "./OseDataModelCharacterAC";

export const key = 'ose.datamodel.character.ac';
export const options = { displayName: 'Character Data Model: AC'}

export default ({
  before,
  beforeEach,
  after,
  describe,
  it,
  expect,
  ...context
}) => {
  const armorAC = 4;
  const shieldAC = 2;
  const armor = {
    name: 'Armor', 
    type: 'armor', 
    system: {
      ac: { value: armorAC },
      aac: { value: armorAC },
      type: 'light',
      equipped: true
    }
  };
  
  const shield = {
    name: 'Shield',
    type: 'armor',
    system: {
      ac: { value: shieldAC },
      aac: { value: shieldAC },
      type: 'shield',
      equipped: true
    } 
  };
  
  const itemsArmor = [armor];
  const itemsShield = [shield];
  const itemsBoth = [armor, shield];
  
  const positiveDexMod = 3;
  const negativeDexMod = -1;

  const positiveArbitraryMod = 2;
  const negativeArbitraryMod = -4;
      
  describe('Naked AC values', () => {
    describe('Returns the default base AC', () => {
      it('When ascending', () => {
        const ac = new OseDataModelCharacterAC(true)
        expect(ac.value).to.equal(OseDataModelCharacterAC.baseAscending);
      })
      it('When descending', () => {
        const ac = new OseDataModelCharacterAC()
        expect(ac.value).to.equal(OseDataModelCharacterAC.baseDescending);
      })
    });
  })
  
  describe('Armored AC values', () => {
    describe('Returns the expected AC, provided equipment', () => {
      describe('With armor', () => {
        it('When ascending', () => {
          const ac = new OseDataModelCharacterAC(true, itemsArmor);
          // @todo this should be the expectation, needs to happen after data migration
          // expect(ac,value).to.equal(OseDataModelCharacterAC.baseAscending + armorAC)
          expect(ac.value).to.equal(armorAC)
        })
        it('When descending', () => {
          const ac = new OseDataModelCharacterAC(false, itemsArmor);
          // @todo this should be the expectation, needs to happen after data migration
          // expect(ac,value).to.equal(OseDataModelCharacterAC.baseDescending - armorAC)
          expect(ac.value).to.equal(armorAC)
        })
      })

      describe('With shield', () => {
        it('When ascending', () => {
          const ac = new OseDataModelCharacterAC(true, itemsShield);
          expect(ac.value).to.equal(OseDataModelCharacterAC.baseAscending + shieldAC);
        })
        it('When descending', () => {
          const ac = new OseDataModelCharacterAC(false, itemsShield);
          expect(ac.value).to.equal(OseDataModelCharacterAC.baseDescending - shieldAC)
        })
      })

      describe('With armor and shield', () => {
        it('When ascending', () => {
          const ac = new OseDataModelCharacterAC(true, itemsBoth);
          // @todo this should be the expectation, needs to happen after data migration
          // expect(ac,value).to.equal(OseDataModelCharacterAC.baseAscending + armorAC + shieldAC)
          expect(ac.value).to.equal(armorAC + shieldAC)
        })
        it('When descending', () => {
          const ac = new OseDataModelCharacterAC(false, itemsBoth);
          // @todo this should be the expectation, needs to happen after data migration
          // expect(ac,value).to.equal(OseDataModelCharacterAC.baseDescending - armorAC - shieldAC)
          expect(ac.value).to.equal(armorAC - shieldAC)
        })
      })
    })
  })
    
  describe('With a dexterity modifier', () => {
    describe('Positive modifier', () => {
      describe('When ascending', () => {
        const base = OseDataModelCharacterAC.baseAscending;
        it('Unarmored, no shield', () => {  
          const ac = new OseDataModelCharacterAC(true, [], positiveDexMod);
          expect(ac.value).to.equal(base + positiveDexMod);
        })
        it('Armored, no shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsArmor, positiveDexMod);
          expect(ac.value).to.equal(armorAC + positiveDexMod);
        })
        it('Unarmored, shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsShield, positiveDexMod);
          expect(ac.value).to.equal(base + shieldAC + positiveDexMod);
        })
        it('Armored, shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsBoth, positiveDexMod);
          expect(ac.value).to.equal(armorAC + shieldAC + positiveDexMod);
        })
      })
      describe('When descending', () => {
        const base = OseDataModelCharacterAC.baseDescending;
        it('Unarmored, no shield', () => {  
          const ac = new OseDataModelCharacterAC(false, [], positiveDexMod);
          expect(ac.value).to.equal(base - positiveDexMod);
        })
        it('Armored, no shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsArmor, positiveDexMod);
          expect(ac.value).to.equal(armorAC - positiveDexMod);
        })
        it('Unarmored, shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsShield, positiveDexMod);
          expect(ac.value).to.equal(base - shieldAC - positiveDexMod);
        })
        it('Armored, shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsBoth, positiveDexMod);
          expect(ac.value).to.equal(armorAC - shieldAC - positiveDexMod);
        })
      })
    })
    describe('Negative modifier', () => {
      describe('When ascending', () => {
        const base = OseDataModelCharacterAC.baseAscending;
        it('Unarmored, no shield', () => {  
          const ac = new OseDataModelCharacterAC(true, [], negativeDexMod);
          expect(ac.value).to.equal(base + negativeDexMod);
        })
        it('Armored, no shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsArmor, negativeDexMod);
          expect(ac.value).to.equal(armorAC + negativeDexMod);
        })
        it('Unarmored, shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsShield, negativeDexMod);
          expect(ac.value).to.equal(base + shieldAC + negativeDexMod);
        })
        it('Armored, shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsBoth, negativeDexMod);
          expect(ac.value).to.equal(armorAC + shieldAC + negativeDexMod);
        })
      })
      describe('When descending', () => {
        const base = OseDataModelCharacterAC.baseDescending;
        it('Unarmored, no shield', () => {  
          const ac = new OseDataModelCharacterAC(false, [], negativeDexMod);
          expect(ac.value).to.equal(base - negativeDexMod);
        })
        it('Armored, no shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsArmor, negativeDexMod);
          expect(ac.value).to.equal(armorAC - negativeDexMod);
        })
        it('Unarmored, shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsShield, negativeDexMod);
          expect(ac.value).to.equal(base - shieldAC - negativeDexMod);
        })
        it('Armored, shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsBoth, negativeDexMod);
          expect(ac.value).to.equal(armorAC - shieldAC - negativeDexMod);
        })
      })
    })
  })

  describe('With an arbitrary modifier', () => {
    describe('Positive modifier', () => {
      describe('When ascending', () => {
        const base = OseDataModelCharacterAC.baseAscending;
        it('Unarmored, no shield', () => {  
          const ac = new OseDataModelCharacterAC(true, [], 0, positiveArbitraryMod);
          expect(ac.value).to.equal(base + positiveArbitraryMod);
        })
        it('Armored, no shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsArmor, 0, positiveArbitraryMod);
          expect(ac.value).to.equal(armorAC + positiveArbitraryMod);
        })
        it('Unarmored, shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsShield, 0, positiveArbitraryMod);
          expect(ac.value).to.equal(base + shieldAC + positiveArbitraryMod);
        })
        it('Armored, shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsBoth, 0, positiveArbitraryMod);
          expect(ac.value).to.equal(armorAC + shieldAC + positiveArbitraryMod);
        })
      })
      describe('When descending', () => {
        const base = OseDataModelCharacterAC.baseDescending;
        it('Unarmored, no shield', () => {  
          const ac = new OseDataModelCharacterAC(false, [], 0, positiveArbitraryMod);
          expect(ac.value).to.equal(base - positiveArbitraryMod);
        })
        it('Armored, no shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsArmor, 0, positiveArbitraryMod);
          expect(ac.value).to.equal(armorAC - positiveArbitraryMod);
        })
        it('Unarmored, shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsShield, 0, positiveArbitraryMod);
          expect(ac.value).to.equal(base - shieldAC - positiveArbitraryMod);
        })
        it('Armored, shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsBoth, 0, positiveArbitraryMod);
          expect(ac.value).to.equal(armorAC - shieldAC - positiveArbitraryMod);
        })
      })
    })
    describe('Negative modifier', () => {
      describe('When ascending', () => {
        const base = OseDataModelCharacterAC.baseAscending;
        it('Unarmored, no shield', () => {  
          const ac = new OseDataModelCharacterAC(true, [], 0, negativeArbitraryMod);
          expect(ac.value).to.equal(base + negativeArbitraryMod);
        })
        it('Armored, no shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsArmor, 0, negativeArbitraryMod);
          expect(ac.value).to.equal(armorAC + negativeArbitraryMod);
        })
        it('Unarmored, shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsShield, 0, negativeArbitraryMod);
          expect(ac.value).to.equal(base + shieldAC + negativeArbitraryMod);
        })
        it('Armored, shield', () => {
          const ac = new OseDataModelCharacterAC(true, itemsBoth, 0, negativeArbitraryMod);
          expect(ac.value).to.equal(armorAC + shieldAC + negativeArbitraryMod);
        })
      })
      describe('When descending', () => {
        const base = OseDataModelCharacterAC.baseDescending;
        it('Unarmored, no shield', () => {  
          const ac = new OseDataModelCharacterAC(false, [], 0, negativeArbitraryMod);
          expect(ac.value).to.equal(base - negativeArbitraryMod);
        })
        it('Armored, no shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsArmor, 0, negativeArbitraryMod);
          expect(ac.value).to.equal(armorAC - negativeArbitraryMod);
        })
        it('Unarmored, shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsShield, 0, negativeArbitraryMod);
          expect(ac.value).to.equal(base - shieldAC - negativeArbitraryMod);
        })
        it('Armored, shield', () => {
          const ac = new OseDataModelCharacterAC(false, itemsBoth, 0, negativeArbitraryMod);
          expect(ac.value).to.equal(armorAC - shieldAC - negativeArbitraryMod);
        })
      })
    })
  })
}