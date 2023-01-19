import { QuenchMethods } from "../../../../e2e";
import OseDataModelCharacterEncumbrance from "../data-model-character-encumbrance";
import EncumbranceBasic from "../data-model-character-encumbrance-basic";
import EncumbranceComplete from "../data-model-character-encumbrance-complete";
import EncumbranceDetailed from "../data-model-character-encumbrance-detailed";
import EncumbranceDisabled from "../data-model-character-encumbrance-disabled";

export const key = "ose.datamodel.character.encumbrance";
export const options = { displayName: "Character Data Model: Encumbrance" };

export default ({ describe, it, expect }: QuenchMethods) => {
  const toPct = (value: number, max: number) =>
    Math.clamped((100 * value) / max, 0, 100);
  const createMockItem = (
    type: string,
    weight: number,
    quantity: number,
    options = {}
  ): Item =>
    new Item.implementation({
      name: `Mock ${type} ${foundry.utils.randomID()}`,
      type,
      system: { ...options, weight, quantity: { value: quantity } },
    }) as Item;

  describe("Disabled Encumbrance", () => {
    it("Is disabled", () => {
      let enc = new OseDataModelCharacterEncumbrance();
      expect(enc.enabled).to.be.false; // eslint-disable-line @typescript-eslint/no-unused-expressions

      enc = new EncumbranceDisabled();
      expect(enc.enabled).to.be.false; // eslint-disable-line @typescript-eslint/no-unused-expressions
    });
  });

  describe("Basic Encumbrance", () => {
    it("Is enabled", () => {
      const enc = new EncumbranceBasic();
      expect(enc.enabled).to.be.true; // eslint-disable-line @typescript-eslint/no-unused-expressions
    });

    it("Returns the appropriate encumbrance steps", () => {
      const enc = new EncumbranceBasic();
      const step = game.settings.get(game.system.id, "significantTreasure");
      const expectedSteps = [(100 * (step as number)) / enc.max];
      expect(enc.steps).to.have.members(expectedSteps); // eslint-disable-line @typescript-eslint/no-unused-expressions
    });

    describe("Returns current carried weight", () => {
      it("As Percentage", () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;

        let enc = new EncumbranceBasic(max, [
          createMockItem("item", pct25, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct25, max)); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceBasic(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct50, max)); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceBasic(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct75, max)); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceBasic(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(100); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceBasic(max, [
          createMockItem("item", max, 1, { treasure: false }),
        ]);
        expect(enc.pct).to.equal(0); // eslint-disable-line @typescript-eslint/no-unused-expressions
      });
      it("As Value", () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;

        let enc = new EncumbranceBasic(max, [
          createMockItem("item", pct25, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct25); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceBasic(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct50); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceBasic(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct75); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceBasic(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(max); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceBasic(max, [
          createMockItem("item", max, 1, { treasure: false }),
        ]);
        expect(enc.value).to.equal(0); // eslint-disable-line @typescript-eslint/no-unused-expressions
      });
      describe("As fully encumbered flag", () => {
        it("Encumbered at full load", () => {
          const enc = new EncumbranceBasic(1600, [
            createMockItem("item", 1600, 1, { treasure: true }),
          ]);
          expect(enc.encumbered).to.be.true; // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        describe("Not encumbered", () => {
          it("from non-treasure items", () => {
            const enc = new EncumbranceBasic(1600, [
              createMockItem("weapon", 1600, 1),
              createMockItem("armor", 1600, 1),
              createMockItem("container", 1600, 1),
              createMockItem("item", 1600, 1),
            ]);
            expect(enc.encumbered).to.be.false; // eslint-disable-line @typescript-eslint/no-unused-expressions
          });
          it("from a partial load", () => {
            const enc = new EncumbranceBasic(1600, [
              createMockItem("item", 400, 1, { treasure: true }),
            ]);
            expect(enc.encumbered).to.be.false; // eslint-disable-line @typescript-eslint/no-unused-expressions
          });
        });
      });
      it('As "over significant treasure threshold" flag', () => {
        let enc = new EncumbranceBasic(1600, [
          createMockItem("item", 400, 1, { treasure: true }),
        ]);
        expect(enc.overSignificantTreasureThreshold).to.be.false; // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceBasic(1600, [
          createMockItem("item", 800, 1, { treasure: true }),
        ]);
        expect(enc.overSignificantTreasureThreshold).to.be.true; // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceBasic(1600, [createMockItem("weapon", 800, 1)]);
        expect(enc.overSignificantTreasureThreshold).to.be.false; // eslint-disable-line @typescript-eslint/no-unused-expressions
      });
    });

    it("Returns max carry weight", () => {
      const setMax = 2000;

      let enc = new EncumbranceBasic(setMax);
      expect(enc.max).to.equal(setMax); // eslint-disable-line @typescript-eslint/no-unused-expressions

      enc = new EncumbranceBasic();
      expect(enc.max).to.equal( // eslint-disable-line @typescript-eslint/no-unused-expressions
        OseDataModelCharacterEncumbrance.baseEncumbranceCap
      );
    });
  });

  describe("Detailed Encumbrance", () => {
    it("Is enabled", () => {
      const enc = new EncumbranceDetailed();
      expect(enc.enabled).to.be.true; // eslint-disable-line @typescript-eslint/no-unused-expressions
    });
    it("Returns the appropriate encumbrance steps", () => {
      const enc = new EncumbranceDetailed();
      expect(enc.steps).to.have.members( // eslint-disable-line @typescript-eslint/no-unused-expressions
        Object.values(OseDataModelCharacterEncumbrance.encumbranceSteps)
      );
    });
    describe("Returns current carried weight", () => {
      it("As Percentage", () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;

        let enc = new EncumbranceDetailed(max, [
          createMockItem("item", pct25, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct25, max)); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct50, max)); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct75, max)); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(100); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", max, 1, { treasure: false }),
        ]);
        expect(enc.pct).to.equal(toPct(EncumbranceDetailed.gearWeight, max)); // eslint-disable-line @typescript-eslint/no-unused-expressions
      });
      it("As Value", () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;

        let enc = new EncumbranceDetailed(max, [
          createMockItem("item", pct25, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct25); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct50); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct75); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(max); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", max, 1, { treasure: false }),
        ]);
        expect(enc.value).to.equal(EncumbranceDetailed.gearWeight); // eslint-disable-line @typescript-eslint/no-unused-expressions
      });
      describe("As fully encumbered flag", () => {
        it("Encumbered at full load", () => {
          const enc = new EncumbranceDetailed(1600, [
            createMockItem("item", 1600, 1, { treasure: true }),
          ]);
          expect(enc.encumbered).to.be.true; // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        describe("Not encumbered", () => {
          it("from non-treasure items", () => {
            const enc = new EncumbranceDetailed(1600, [
              createMockItem("item", 1600, 1),
            ]);
            expect(enc.encumbered).to.be.false; // eslint-disable-line @typescript-eslint/no-unused-expressions
            expect(enc.value).to.equal(80); // eslint-disable-line @typescript-eslint/no-unused-expressions
          });
          it("from a partial load", () => {
            const enc = new EncumbranceDetailed(1600, [
              createMockItem("item", 400, 1, { treasure: true }),
            ]);
            expect(enc.encumbered).to.be.false; // eslint-disable-line @typescript-eslint/no-unused-expressions
          });
        });
      });
    });

    it("Returns max carry weight", () => {
      const setMax = 2000;

      let enc = new EncumbranceDetailed(setMax);
      expect(enc.max).to.equal(setMax); // eslint-disable-line @typescript-eslint/no-unused-expressions

      enc = new EncumbranceDetailed();
      expect(enc.max).to.equal( // eslint-disable-line @typescript-eslint/no-unused-expressions
        OseDataModelCharacterEncumbrance.baseEncumbranceCap
      );
    });
  });

  describe("Complete Encumbrance", () => {
    it("Is enabled", () => {
      const enc = new EncumbranceComplete();
      expect(enc.enabled).to.be.true; // eslint-disable-line @typescript-eslint/no-unused-expressions
    });
    it("Returns the appropriate encumbrance steps", () => {
      const enc = new EncumbranceComplete();
      expect(enc.steps).to.have.members( // eslint-disable-line @typescript-eslint/no-unused-expressions
        Object.values(OseDataModelCharacterEncumbrance.encumbranceSteps)
      );
    });
    describe("Returns current carried weight", () => {
      it("As Percentage", () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;

        let enc = new EncumbranceComplete(max, [
          createMockItem("item", pct25, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct25, max)); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceComplete(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct50, max)); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceComplete(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct75, max)); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceComplete(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(100); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceComplete(max, [
          createMockItem("item", max, 1, { treasure: false }),
        ]);
        expect(enc.pct).to.equal(100); // eslint-disable-line @typescript-eslint/no-unused-expressions
      });
      it("As Value", () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;

        let enc = new EncumbranceComplete(max, [
          createMockItem("item", pct25, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct25); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceComplete(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct50); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceComplete(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct75); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceComplete(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(max); // eslint-disable-line @typescript-eslint/no-unused-expressions

        enc = new EncumbranceComplete(max, [
          createMockItem("item", max, 1, { treasure: false }),
        ]);
        expect(enc.value).to.equal(max); // eslint-disable-line @typescript-eslint/no-unused-expressions
      });
      describe("As fully encumbered flag", () => {
        it("Encumbered at full load", () => {
          let enc = new EncumbranceComplete(1600, [
            createMockItem("item", 1600, 1, { treasure: true }),
          ]);
          expect(enc.encumbered).to.be.true; // eslint-disable-line @typescript-eslint/no-unused-expressions
          enc = new EncumbranceComplete(1600, [
            createMockItem("item", 1600, 1, { treasure: false }),
          ]);
          expect(enc.encumbered).to.be.true; // eslint-disable-line @typescript-eslint/no-unused-expressions
        });
        describe("Not encumbered", () => {
          it("from a partial load", () => {
            const enc = new EncumbranceComplete(1600, [
              createMockItem("item", 400, 1, { treasure: true }),
            ]);
            expect(enc.encumbered).to.be.false; // eslint-disable-line @typescript-eslint/no-unused-expressions
          });
        });
      });
    });

    it("Returns max carry weight", () => {
      const setMax = 2000;

      let enc = new EncumbranceComplete(setMax);
      expect(enc.max).to.equal(setMax); // eslint-disable-line @typescript-eslint/no-unused-expressions

      enc = new EncumbranceComplete();
      expect(enc.max).to.equal( // eslint-disable-line @typescript-eslint/no-unused-expressions
        OseDataModelCharacterEncumbrance.baseEncumbranceCap
      );
    });
  });
};
