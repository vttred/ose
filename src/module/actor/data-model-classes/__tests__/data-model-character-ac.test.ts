/**
 * @file Tests for the class representing a creature data model's AC
 */
import { QuenchMethods } from "../../../../e2e";
import OseDataModelCharacterAC from "../data-model-character-ac";

export const key = "ose.datamodel.character.ac";
export const options = { displayName: "Character Data Model: AC" };

export default ({ describe, it, expect }: QuenchMethods) => {
  const armorAC = 4;
  const shieldAC = 2;
  // eslint-disable-next-line new-cap
  const armor = new Item.implementation({
    name: "Armor",
    type: "armor",
    system: {
      ac: { value: armorAC },
      aac: { value: armorAC },
      type: "light",
      equipped: true,
    },
  }) as Item;

  // eslint-disable-next-line new-cap
  const shield = new Item.implementation({
    name: "Shield",
    type: "armor",
    system: {
      ac: { value: shieldAC },
      aac: { value: shieldAC },
      type: "shield",
      equipped: true,
    },
  }) as Item;

  const itemsArmor = [armor];
  const itemsShield = [shield] as Item[];
  const itemsBoth = [armor, shield] as Item[];

  const positiveDexMod = 3;
  const negativeDexMod = -1;

  const positiveArbitraryMod = 2;
  const negativeArbitraryMod = -4;

  describe("Naked AC values", () => {
    describe("Returns the default base AC", () => {
      it("When ascending", () => {
        const ac = new OseDataModelCharacterAC(true);
        expect(ac.value).to.equal(OseDataModelCharacterAC.baseAscending); // eslint-disable-line @typescript-eslint/no-unused-expressions
      });
      it("When descending", () => {
        const ac = new OseDataModelCharacterAC();
        expect(ac.value).to.equal(OseDataModelCharacterAC.baseDescending); // eslint-disable-line @typescript-eslint/no-unused-expressions
      });
    });
  });

  describe("Armored AC values", () => {
    describe("Returns the expected AC, provided equipment", () => {
      describe("With armor", () => {
        it("When ascending", () => {
          const ac = new OseDataModelCharacterAC(true, itemsArmor);
          // @todo this should be the expectation, needs to happen after data migration
          // expect(ac,value).to.equal(OseDataModelCharacterAC.baseAscending + armorAC) // eslint-disable-line @typescript-eslint/no-unused-expressions
          expect(ac.value).to.equal(armorAC); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("When descending", () => {
          const ac = new OseDataModelCharacterAC(false, itemsArmor);
          // @todo this should be the expectation, needs to happen after data migration
          // expect(ac,value).to.equal(OseDataModelCharacterAC.baseDescending - armorAC) // eslint-disable-line @typescript-eslint/no-unused-expressions
          expect(ac.value).to.equal(armorAC); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
      });

      describe("With shield", () => {
        it("When ascending", () => {
          const ac = new OseDataModelCharacterAC(true, itemsShield);
          expect(ac.value).to.equal(
            // eslint-disable-line @typescript-eslint/no-unused-expressions
            OseDataModelCharacterAC.baseAscending + shieldAC
          );
        });
        it("When descending", () => {
          const ac = new OseDataModelCharacterAC(false, itemsShield);
          expect(ac.value).to.equal(
            // eslint-disable-line @typescript-eslint/no-unused-expressions
            OseDataModelCharacterAC.baseDescending - shieldAC
          );
        });
      });

      describe("With armor and shield", () => {
        it("When ascending", () => {
          const ac = new OseDataModelCharacterAC(true, itemsBoth);
          // @todo this should be the expectation, needs to happen after data migration
          // expect(ac,value).to.equal(OseDataModelCharacterAC.baseAscending + armorAC + shieldAC) // eslint-disable-line @typescript-eslint/no-unused-expressions
          expect(ac.value).to.equal(armorAC + shieldAC); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("When descending", () => {
          const ac = new OseDataModelCharacterAC(false, itemsBoth);
          // @todo this should be the expectation, needs to happen after data migration
          // expect(ac,value).to.equal(OseDataModelCharacterAC.baseDescending - armorAC - shieldAC) // eslint-disable-line @typescript-eslint/no-unused-expressions
          expect(ac.value).to.equal(armorAC - shieldAC); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
      });
    });
  });

  describe("With a dexterity modifier", () => {
    describe("Positive modifier", () => {
      describe("When ascending", () => {
        const base = OseDataModelCharacterAC.baseAscending;
        it("Unarmored, no shield", () => {
          const ac = new OseDataModelCharacterAC(true, [], positiveDexMod);
          expect(ac.value).to.equal(base + positiveDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsArmor,
            positiveDexMod
          );
          expect(ac.value).to.equal(armorAC + positiveDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Unarmored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsShield,
            positiveDexMod
          );
          expect(ac.value).to.equal(base + shieldAC + positiveDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsBoth,
            positiveDexMod
          );
          expect(ac.value).to.equal(armorAC + shieldAC + positiveDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
      });
      describe("When descending", () => {
        const base = OseDataModelCharacterAC.baseDescending;
        it("Unarmored, no shield", () => {
          const ac = new OseDataModelCharacterAC(false, [], positiveDexMod);
          expect(ac.value).to.equal(base - positiveDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsArmor,
            positiveDexMod
          );
          expect(ac.value).to.equal(armorAC - positiveDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Unarmored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsShield,
            positiveDexMod
          );
          expect(ac.value).to.equal(base - shieldAC - positiveDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsBoth,
            positiveDexMod
          );
          expect(ac.value).to.equal(armorAC - shieldAC - positiveDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
      });
    });
    describe("Negative modifier", () => {
      describe("When ascending", () => {
        const base = OseDataModelCharacterAC.baseAscending;
        it("Unarmored, no shield", () => {
          const ac = new OseDataModelCharacterAC(true, [], negativeDexMod);
          expect(ac.value).to.equal(base + negativeDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsArmor,
            negativeDexMod
          );
          expect(ac.value).to.equal(armorAC + negativeDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Unarmored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsShield,
            negativeDexMod
          );
          expect(ac.value).to.equal(base + shieldAC + negativeDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsBoth,
            negativeDexMod
          );
          expect(ac.value).to.equal(armorAC + shieldAC + negativeDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
      });
      describe("When descending", () => {
        const base = OseDataModelCharacterAC.baseDescending;
        it("Unarmored, no shield", () => {
          const ac = new OseDataModelCharacterAC(false, [], negativeDexMod);
          expect(ac.value).to.equal(base - negativeDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsArmor,
            negativeDexMod
          );
          expect(ac.value).to.equal(armorAC - negativeDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Unarmored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsShield,
            negativeDexMod
          );
          expect(ac.value).to.equal(base - shieldAC - negativeDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsBoth,
            negativeDexMod
          );
          expect(ac.value).to.equal(armorAC - shieldAC - negativeDexMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
      });
    });
  });

  describe("With an arbitrary modifier", () => {
    describe("Positive modifier", () => {
      describe("When ascending", () => {
        const base = OseDataModelCharacterAC.baseAscending;
        it("Unarmored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            [],
            0,
            positiveArbitraryMod
          );
          expect(ac.value).to.equal(base + positiveArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsArmor,
            0,
            positiveArbitraryMod
          );
          expect(ac.value).to.equal(armorAC + positiveArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Unarmored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsShield,
            0,
            positiveArbitraryMod
          );
          expect(ac.value).to.equal(base + shieldAC + positiveArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsBoth,
            0,
            positiveArbitraryMod
          );
          expect(ac.value).to.equal(armorAC + shieldAC + positiveArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
      });
      describe("When descending", () => {
        const base = OseDataModelCharacterAC.baseDescending;
        it("Unarmored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            [],
            0,
            positiveArbitraryMod
          );
          expect(ac.value).to.equal(base - positiveArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsArmor,
            0,
            positiveArbitraryMod
          );
          expect(ac.value).to.equal(armorAC - positiveArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Unarmored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsShield,
            0,
            positiveArbitraryMod
          );
          expect(ac.value).to.equal(base - shieldAC - positiveArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsBoth,
            0,
            positiveArbitraryMod
          );
          expect(ac.value).to.equal(armorAC - shieldAC - positiveArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
      });
    });
    describe("Negative modifier", () => {
      describe("When ascending", () => {
        const base = OseDataModelCharacterAC.baseAscending;
        it("Unarmored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            [],
            0,
            negativeArbitraryMod
          );
          expect(ac.value).to.equal(base + negativeArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsArmor,
            0,
            negativeArbitraryMod
          );
          expect(ac.value).to.equal(armorAC + negativeArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Unarmored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsShield,
            0,
            negativeArbitraryMod
          );
          expect(ac.value).to.equal(base + shieldAC + negativeArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            true,
            itemsBoth,
            0,
            negativeArbitraryMod
          );
          expect(ac.value).to.equal(armorAC + shieldAC + negativeArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
      });
      describe("When descending", () => {
        const base = OseDataModelCharacterAC.baseDescending;
        it("Unarmored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            [],
            0,
            negativeArbitraryMod
          );
          expect(ac.value).to.equal(base - negativeArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, no shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsArmor,
            0,
            negativeArbitraryMod
          );
          expect(ac.value).to.equal(armorAC - negativeArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Unarmored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsShield,
            0,
            negativeArbitraryMod
          );
          expect(ac.value).to.equal(base - shieldAC - negativeArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        it("Armored, shield", () => {
          const ac = new OseDataModelCharacterAC(
            false,
            itemsBoth,
            0,
            negativeArbitraryMod
          );
          expect(ac.value).to.equal(armorAC - shieldAC - negativeArbitraryMod); // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
      });
    });
  });
};
