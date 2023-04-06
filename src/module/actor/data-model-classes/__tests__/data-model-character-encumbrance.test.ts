/**
 * @file Tests for encumbrance schemes that are part of the Old School Essentials SRD
 */
import { QuenchMethods } from "../../../../e2e";
import OseDataModelCharacterEncumbrance from "../data-model-character-encumbrance";
import EncumbranceBasic from "../data-model-character-encumbrance-basic";
import EncumbranceComplete from "../data-model-character-encumbrance-complete";
import EncumbranceDetailed from "../data-model-character-encumbrance-detailed";
import EncumbranceDisabled from "../data-model-character-encumbrance-disabled";

export const key = "ose.actor.datamodel.character.encumbrance";
export const options = {
  displayName: "OSE: Actor: Data Model: Character Encumbrance",
};

const toPct = (value: number, max: number) =>
  Math.clamped((100 * value) / max, 0, 100);
const createMockItem = (
  type: string,
  weight: number,
  quantity: number,
  itemOptions = {}
): Item =>
  // eslint-disable-next-line new-cap
  new Item.implementation({
    name: `Mock ${type} ${foundry.utils.randomID()}`,
    type,
    system: { ...itemOptions, weight, quantity: { value: quantity } },
  }) as Item;

export default ({ describe, it, expect }: QuenchMethods) => {
  describe("Disabled Encumbrance", () => {
    it("Is disabled", () => {
      let enc = new OseDataModelCharacterEncumbrance();
      expect(enc.enabled).to.be.false;

      enc = new EncumbranceDisabled();
      expect(enc.enabled).to.be.false;
    });
  });

  describe("Basic Encumbrance", () => {
    it("Is enabled", () => {
      const enc = new EncumbranceBasic();
      expect(enc.enabled).to.be.true;
    });

    it("Returns the appropriate encumbrance steps", () => {
      const enc = new EncumbranceBasic();
      const step = game.settings.get(game.system.id, "significantTreasure");
      const expectedSteps = [(100 * (step as number)) / enc.max];
      expect(enc.steps).to.have.members(expectedSteps);
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
        expect(enc.pct).to.equal(toPct(pct25, max));

        enc = new EncumbranceBasic(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct50, max));

        enc = new EncumbranceBasic(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct75, max));

        enc = new EncumbranceBasic(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(100);

        enc = new EncumbranceBasic(max, [
          createMockItem("item", max, 1, { treasure: false }),
        ]);
        expect(enc.pct).to.equal(0);
      });
      it("As Value", () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;

        let enc = new EncumbranceBasic(max, [
          createMockItem("item", pct25, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct25);

        enc = new EncumbranceBasic(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct50);

        enc = new EncumbranceBasic(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct75);

        enc = new EncumbranceBasic(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(max);

        enc = new EncumbranceBasic(max, [
          createMockItem("item", max, 1, { treasure: false }),
        ]);
        expect(enc.value).to.equal(0);
      })
      describe('As fully encumbered flag', () => {
        it('Encumbered over full load (1600.1)', () => {
          const enc = new EncumbranceBasic(
            1600,
            [createMockItem('item', 1600.1, 1, { treasure: true })]
          );
          expect(enc.encumbered).to.be.true;
        })
        describe('Not encumbered', () => {
          it('from non-treasure items', () => {
            const enc = new EncumbranceBasic(
              1600,
              [
                createMockItem('weapon', 1600.1, 1),
                createMockItem('armor', 1600.1, 1),
                createMockItem('container', 1600.1, 1),
                createMockItem('item', 1600.1, 1)
              ]
            );
            expect(enc.encumbered).to.be.false;
          });
          it("from a partial load", () => {
            const enc = new EncumbranceBasic(1600, [
              createMockItem("item", 400, 1, { treasure: true }),
            ]);
            expect(enc.encumbered).to.be.false;
          });
        });
      });
      it('As "over significant treasure threshold" flag', () => {
        let enc = new EncumbranceBasic(1600, [
          createMockItem("item", 400, 1, { treasure: true }),
        ]);
        expect(enc.overSignificantTreasureThreshold).to.be.false;

        enc = new EncumbranceBasic(1600, [
          createMockItem("item", 800, 1, { treasure: true }),
        ]);
        expect(enc.overSignificantTreasureThreshold).to.be.true;

        enc = new EncumbranceBasic(1600, [createMockItem("weapon", 800, 1)]);
        expect(enc.overSignificantTreasureThreshold).to.be.false;
      });
    });

    it("Returns max carry weight", () => {
      const setMax = 2000;

      let enc = new EncumbranceBasic(setMax);
      expect(enc.max).to.equal(setMax);

      enc = new EncumbranceBasic();
      expect(enc.max).to.equal(
        OseDataModelCharacterEncumbrance.baseEncumbranceCap
      );
    });
  });

  describe("Detailed Encumbrance", () => {
    it("Is enabled", () => {
      const enc = new EncumbranceDetailed();
      expect(enc.enabled).to.be.true;
    });
    it("Returns the appropriate encumbrance steps", () => {
      const enc = new EncumbranceDetailed();
      expect(enc.steps).to.have.members(
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
        expect(enc.pct).to.equal(toPct(pct25, max));

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct50, max));

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct75, max));

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(100);

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", max, 1, { treasure: false }),
        ]);
        expect(enc.pct).to.equal(toPct(EncumbranceDetailed.gearWeight, max));
      });
      it("As Value", () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;

        let enc = new EncumbranceDetailed(max, [
          createMockItem("item", pct25, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct25);

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct50);

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct75);

        enc = new EncumbranceDetailed(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(max);

        enc = new EncumbranceDetailed(
          max,
          [createMockItem('item', max, 1, { treasure: false })]
        );
        expect(enc.value).to.equal(
          EncumbranceDetailed.gearWeight,
        );

      })
      describe('As fully encumbered flag', () => {
        it('Encumbered over full load (1600.1)', () => {
          const enc = new EncumbranceDetailed(
            1600,
            [createMockItem('item', 1600.1, 1, { treasure: true })]
          );
          expect(enc.encumbered).to.be.true;
        })
        describe('Not encumbered', () => {
          it('from non-treasure items', () => {
            const enc = new EncumbranceDetailed(
              1600,
              [
                createMockItem('item', 1600.1, 1)
              ]
            );
            expect(enc.encumbered).to.be.false;
            expect(enc.value).to.equal(80);
          });
          it("from a partial load", () => {
            const enc = new EncumbranceDetailed(1600, [
              createMockItem("item", 400, 1, { treasure: true }),
            ]);
            expect(enc.encumbered).to.be.false;
          });
        });
      });
    });

    it("Returns max carry weight", () => {
      const setMax = 2000;

      let enc = new EncumbranceDetailed(setMax);
      expect(enc.max).to.equal(setMax);

      enc = new EncumbranceDetailed();
      expect(enc.max).to.equal(
        OseDataModelCharacterEncumbrance.baseEncumbranceCap
      );
    });
  });

  describe("Complete Encumbrance", () => {
    it("Is enabled", () => {
      const enc = new EncumbranceComplete();
      expect(enc.enabled).to.be.true;
    });
    it("Returns the appropriate encumbrance steps", () => {
      const enc = new EncumbranceComplete();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(enc.steps).to.have.members(
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
        expect(enc.pct).to.equal(toPct(pct25, max));

        enc = new EncumbranceComplete(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct50, max));

        enc = new EncumbranceComplete(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(toPct(pct75, max));

        enc = new EncumbranceComplete(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.pct).to.equal(100);

        enc = new EncumbranceComplete(max, [
          createMockItem("item", max, 1, { treasure: false }),
        ]);
        expect(enc.pct).to.equal(100);
      });
      it("As Value", () => {
        const max = 1600;
        const pct25 = 400;
        const pct50 = 800;
        const pct75 = 1200;

        let enc = new EncumbranceComplete(max, [
          createMockItem("item", pct25, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct25);

        enc = new EncumbranceComplete(max, [
          createMockItem("item", pct50, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct50);

        enc = new EncumbranceComplete(max, [
          createMockItem("item", pct75, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(pct75);

        enc = new EncumbranceComplete(max, [
          createMockItem("item", max, 1, { treasure: true }),
        ]);
        expect(enc.value).to.equal(max);

        enc = new EncumbranceComplete(max, [
          createMockItem("item", max, 1, { treasure: false }),
        ]);
        expect(enc.value).to.equal(max);

      })
      describe('As fully encumbered flag', () => {
        it('Encumbered over full load (1600.1)', () => {
          let enc = new EncumbranceComplete(
            1600,
            [createMockItem('item', 1600.1, 1, { treasure: true })]
          );
          expect(enc.encumbered).to.be.true;
          enc = new EncumbranceComplete(
            1600,
            [createMockItem('item', 1600.1, 1, { treasure: false })]
          );
          expect(enc.encumbered).to.be.true;
        })
        describe('Not encumbered', () => {
          it('from a partial load', () => {
            const enc = new EncumbranceComplete(
              1600,
              [createMockItem('item', 400, 1, { treasure: true })]
            );
            expect(enc.encumbered).to.be.false;
          })
        })
      });
      describe("As fully encumbered flag", () => {
        it("Encumbered at full load", () => {
          let enc = new EncumbranceComplete(1600, [
            createMockItem("item", 1600, 1, { treasure: true }),
          ]);
          expect(enc.encumbered).to.be.true;
          enc = new EncumbranceComplete(1600, [
            createMockItem("item", 1600, 1, { treasure: false }),
          ]);
          expect(enc.encumbered).to.be.true;
        });
        describe("Not encumbered", () => {
          it("from a partial load", () => {
            const enc = new EncumbranceComplete(1600, [
              createMockItem("item", 400, 1, { treasure: true }),
            ]);
            expect(enc.encumbered).to.be.false;
          });
        });
      });
    });

    it("Returns max carry weight", () => {
      const setMax = 2000;

      let enc = new EncumbranceComplete(setMax);
      expect(enc.max).to.equal(setMax);

      enc = new EncumbranceComplete();

      expect(enc.max).to.equal(
        OseDataModelCharacterEncumbrance.baseEncumbranceCap
      );
    });
  });
};
