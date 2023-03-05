/**
 * @file Tests for the data model class that determines character movement speed
 */
import { QuenchMethods } from "../../../../e2e";
import OseDataModelCharacterEncumbrance from "../data-model-character-encumbrance";
import EncumbranceBasic from "../data-model-character-encumbrance-basic";
import EncumbranceComplete from "../data-model-character-encumbrance-complete";
import EncumbranceDetailed from "../data-model-character-encumbrance-detailed";
import OseDataModelCharacterMove from "../data-model-character-move";

export const key = "ose.actor.datamodel.character.move";
export const options = {
  displayName: "OSE: Actor: Data Model: Character Movement",
};

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
  describe("Prevent autocalculation when...", () => {
    it("Autocalculation is off", () => {
      const enc = new EncumbranceBasic();
      const move = new OseDataModelCharacterMove(enc, false);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate);
    });
    it("Encumbrance is disabled", () => {
      const enc = new OseDataModelCharacterEncumbrance("disabled");
      const move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate);
    });
    it("Encumbrance is not provided", () => {
      const move = new OseDataModelCharacterMove();
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate);
    });
  });

  describe("Correctly calculates from Basic Encumbrance", () => {
    it("While unarmored", () => {
      let enc = new EncumbranceBasic();
      let move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate);

      enc = new EncumbranceBasic(undefined, [
        createMockItem("armor", 100, 1, { type: "unarmored", equipped: true }),
        createMockItem("armor", 100, 1, { type: "light", equipped: false }),
        createMockItem("armor", 100, 1, { type: "heavy", equipped: false }),
      ]);
      move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(move.encounter).to.equal(
        OseDataModelCharacterMove.baseMoveRate / 3
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(move.overland).to.equal(
        OseDataModelCharacterMove.baseMoveRate / 5
      );
    });
    it("While lightly armored", () => {
      const enc = new EncumbranceBasic(undefined, [
        createMockItem("armor", 100, 1, { type: "unarmored", equipped: false }),
        createMockItem("armor", 100, 1, { type: "light", equipped: true }),
        createMockItem("armor", 100, 1, { type: "heavy", equipped: false }),
      ]);
      const move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate * 0.75);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(move.encounter).to.equal(
        (OseDataModelCharacterMove.baseMoveRate * 0.75) / 3
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(move.overland).to.equal(
        (OseDataModelCharacterMove.baseMoveRate * 0.75) / 5
      );
    });
    it("While heavily armored", () => {
      const enc = new EncumbranceBasic(undefined, [
        createMockItem("armor", 100, 1, { type: "unarmored", equipped: false }),
        createMockItem("armor", 100, 1, { type: "light", equipped: false }),
        createMockItem("armor", 100, 1, { type: "heavy", equipped: true }),
      ]);
      const move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate * 0.5);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(move.encounter).to.equal(
        (OseDataModelCharacterMove.baseMoveRate * 0.5) / 3
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(move.overland).to.equal(
        (OseDataModelCharacterMove.baseMoveRate * 0.5) / 5
      );
    });
    it("While carrying a significant amount of treasure", () => {
      let enc = new EncumbranceBasic(undefined, [
        createMockItem("item", EncumbranceBasic.significantTreasure - 1, 1, {
          treasure: true,
        }),
      ]);
      let move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(move.encounter).to.equal(
        OseDataModelCharacterMove.baseMoveRate / 3
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(move.overland).to.equal(
        OseDataModelCharacterMove.baseMoveRate / 5
      );

      enc = new EncumbranceBasic(undefined, [
        createMockItem("item", EncumbranceBasic.significantTreasure, 1, {
          treasure: true,
        }),
      ]);
      move = new OseDataModelCharacterMove(enc);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate - 30);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(move.encounter).to.equal(
        (OseDataModelCharacterMove.baseMoveRate - 30) / 3
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(move.overland).to.equal(
        (OseDataModelCharacterMove.baseMoveRate - 30) / 5
      );
    });
  });
  describe("Correctly calculates from Detailed Encumbrance", () => {
    it("At unencumbered", () => {
      const expectedBase = OseDataModelCharacterMove.baseMoveRate;
      const expectedEncounter = expectedBase / 3;
      const expectedOverland = expectedBase / 5;

      let enc = new EncumbranceDetailed();
      let move = new OseDataModelCharacterMove(enc);

      expect(move.base).to.equal(expectedBase);
      expect(move.encounter).to.equal(expectedEncounter);
      expect(move.overland).to.equal(expectedOverland);

      enc = new EncumbranceDetailed(undefined, [
        createMockItem("item", 800, 1),
      ]);
      move = new OseDataModelCharacterMove(enc);

      expect(move.base).to.equal(expectedBase);
      expect(move.encounter).to.equal(expectedEncounter);
      expect(move.overland).to.equal(expectedOverland);
    });
    it("At 12.5% encumbered", () => {
      const expectedBase = OseDataModelCharacterMove.baseMoveRate * 0.75;
      const expectedEncounter = expectedBase / 3;
      const expectedOverland = expectedBase / 5;

      const enc = new EncumbranceDetailed(undefined, [
        createMockItem(
          "item",
          OseDataModelCharacterEncumbrance.baseEncumbranceCap * 0.125,
          1,
          { treasure: true }
        ),
      ]);
      const move = new OseDataModelCharacterMove(enc);

      expect(move.base).to.equal(expectedBase);
      expect(move.encounter).to.equal(expectedEncounter);
      expect(move.overland).to.equal(expectedOverland);
    });
    it("At 25% encumbered", () => {
      const expectedBase = OseDataModelCharacterMove.baseMoveRate * 0.5;
      const expectedEncounter = expectedBase / 3;
      const expectedOverland = expectedBase / 5;

      const enc = new EncumbranceDetailed(undefined, [
        createMockItem(
          "item",
          OseDataModelCharacterEncumbrance.baseEncumbranceCap * 0.25,
          1,
          { treasure: true }
        ),
      ]);
      const move = new OseDataModelCharacterMove(enc);

      expect(move.base).to.equal(expectedBase);
      expect(move.encounter).to.equal(expectedEncounter);
      expect(move.overland).to.equal(expectedOverland);
    });
    it("At 50% encumbered", () => {
      const expectedBase = OseDataModelCharacterMove.baseMoveRate * 0.25;
      const expectedEncounter = expectedBase / 3;
      const expectedOverland = expectedBase / 5;

      const enc = new EncumbranceDetailed(undefined, [
        createMockItem(
          "item",
          OseDataModelCharacterEncumbrance.baseEncumbranceCap * 0.75,
          1,
          { treasure: true }
        ),
      ]);
      const move = new OseDataModelCharacterMove(enc);

      expect(move.encounter).to.equal(expectedEncounter);
      expect(move.overland).to.equal(expectedOverland);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate * 0.25);
    });
    it("At fully encumbered", () => {
      const expectedBase = 0;
      const expectedEncounter = 0;
      const expectedOverland = 0;

      const enc = new EncumbranceDetailed(undefined, [
        createMockItem(
          "item",
          OseDataModelCharacterEncumbrance.baseEncumbranceCap,
          1,
          { treasure: true }
        ),
      ]);
      const move = new OseDataModelCharacterMove(enc);

      expect(move.base).to.equal(expectedBase);
      expect(move.encounter).to.equal(expectedEncounter);
      expect(move.overland).to.equal(expectedOverland);
    });
  });
  describe("Correctly calculates from Complete Encumbrance", () => {
    it("At unencumbered", () => {
      const expectedBase = OseDataModelCharacterMove.baseMoveRate;
      const expectedEncounter = expectedBase / 3;
      const expectedOverland = expectedBase / 5;

      const enc = new EncumbranceComplete();
      const move = new OseDataModelCharacterMove(enc);

      expect(move.base).to.equal(expectedBase);
      expect(move.encounter).to.equal(expectedEncounter);
      expect(move.overland).to.equal(expectedOverland);
    });
    it("At 12.5% encumbered", () => {
      const expectedBase = OseDataModelCharacterMove.baseMoveRate * 0.75;
      const expectedEncounter = expectedBase / 3;
      const expectedOverland = expectedBase / 5;

      const enc = new EncumbranceComplete(undefined, [
        createMockItem(
          "item",
          OseDataModelCharacterEncumbrance.baseEncumbranceCap * 0.125,
          1
        ),
      ]);
      const move = new OseDataModelCharacterMove(enc);

      expect(move.base).to.equal(expectedBase);
      expect(move.encounter).to.equal(expectedEncounter);
      expect(move.overland).to.equal(expectedOverland);
    });
    it("At 25% encumbered", () => {
      const expectedBase = OseDataModelCharacterMove.baseMoveRate * 0.5;
      const expectedEncounter = expectedBase / 3;
      const expectedOverland = expectedBase / 5;

      const enc = new EncumbranceComplete(undefined, [
        createMockItem(
          "item",
          OseDataModelCharacterEncumbrance.baseEncumbranceCap * 0.25,
          1
        ),
      ]);
      const move = new OseDataModelCharacterMove(enc);

      expect(move.base).to.equal(expectedBase);
      expect(move.encounter).to.equal(expectedEncounter);
      expect(move.overland).to.equal(expectedOverland);
    });
    it("At 50% encumbered", () => {
      const expectedBase = OseDataModelCharacterMove.baseMoveRate * 0.25;
      const expectedEncounter = expectedBase / 3;
      const expectedOverland = expectedBase / 5;

      const enc = new EncumbranceComplete(undefined, [
        createMockItem(
          "item",
          OseDataModelCharacterEncumbrance.baseEncumbranceCap * 0.75,
          1
        ),
      ]);
      const move = new OseDataModelCharacterMove(enc);

      expect(move.encounter).to.equal(expectedEncounter);
      expect(move.overland).to.equal(expectedOverland);
      expect(move.base).to.equal(OseDataModelCharacterMove.baseMoveRate * 0.25);
    });
    it("At fully encumbered", () => {
      const expectedBase = 0;
      const expectedEncounter = 0;
      const expectedOverland = 0;

      const enc = new EncumbranceComplete(undefined, [
        createMockItem(
          "item",
          OseDataModelCharacterEncumbrance.baseEncumbranceCap,
          1
        ),
      ]);
      const move = new OseDataModelCharacterMove(enc);

      expect(move.base).to.equal(expectedBase);
      expect(move.encounter).to.equal(expectedEncounter);
      expect(move.overland).to.equal(expectedOverland);
    });
  });
};
