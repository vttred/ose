/**
 * @file Quench unit tests for the Character data model class.
 */
// eslint-disable-next-line import/no-cycle
import { QuenchMethods } from "../../../e2e";
import {
  cleanUpActorsByKey,
  createMockActorKey,
  getMockActorKey,
} from "../../../e2e/testUtils";
import OseDataModelCharacter from "../data-model-character";

export const key = "ose.actor.datamodel.character";
export const options = { displayName: "OSE: Actor: Data Model: Character" };

const createMockActor = () => createMockActorKey("character", {}, key);

export default ({ describe, it, expect, after, before }: QuenchMethods) => {
  const dataModel = new OseDataModelCharacter();
  const ascendingACSetting = game.settings.get(game.system.id, "ascendingAC");
  const initiativeSetting = game.settings.get(game.system.id, "initiative");

  after(() => {
    game.settings.set(game.system.id, "ascendingAC", ascendingACSetting);
    game.settings.set(game.system.id, "initiative", initiativeSetting);
    cleanUpActorsByKey(key);
  });

  // @todo: Can this be tested without creating an actor?
  describe("prepareDerivedData()", () => {
    before(async () => {
      await createMockActor();
    });

    it("has scores", async () => {
      const actor = await getMockActorKey(key);
      expect(actor?.system.scores).not.undefined;
      expect(actor?.system.scores.str).not.undefined;
      expect(actor?.system.scores.str.od).not.undefined;
      expect(actor?.system.scores.int).not.undefined;
      expect(actor?.system.scores.int.literacy).not.undefined;
      expect(actor?.system.scores.int.spoken).not.undefined;
      expect(actor?.system.scores.wis).not.undefined;
      expect(actor?.system.scores.dex).not.undefined;
      expect(actor?.system.scores.dex.init).not.undefined;
      expect(actor?.system.scores.con).not.undefined;
      expect(actor?.system.scores.cha).not.undefined;
      expect(actor?.system.scores.cha.loyalty).not.undefined;
      expect(actor?.system.scores.cha.retain).not.undefined;
      expect(actor?.system.scores.cha.npc).not.undefined;
    });

    it("has encumbrance", async () => {
      const actor = await getMockActorKey(key);
      expect(actor?.system.encumbrance).not.undefined;
      expect(actor?.system.encumbrance.variant).not.undefined;
      expect(actor?.system.encumbrance.enabled).not.undefined;
      expect(actor?.system.encumbrance.pct).not.undefined;
      expect(actor?.system.encumbrance.encumbered).not.undefined;
      expect(actor?.system.encumbrance.steps).not.undefined;
      expect(actor?.system.encumbrance.value).not.undefined;
      expect(actor?.system.encumbrance.max).not.undefined;
      expect(actor?.system.encumbrance.atHalfEncumbered).not.undefined;
      expect(actor?.system.encumbrance.atQuarterEncumbered).not.undefined;
      expect(actor?.system.encumbrance.atEighthEncumbered).not.undefined;
    });

    it("has movement", async () => {
      const actor = await getMockActorKey(key);
      expect(actor?.system.movement).not.undefined;
      expect(actor?.system.movement.base).not.undefined;
      expect(actor?.system.movement.encounter).not.undefined;
      expect(actor?.system.movement.overland).not.undefined;
    });

    it("has ac", async () => {
      const actor = await getMockActorKey(key);
      expect(actor?.system.ac).not.undefined;
      expect(actor?.system.ac.base).not.undefined;
      expect(actor?.system.ac.naked).not.undefined;
      expect(actor?.system.ac.shield).not.undefined;
      expect(actor?.system.ac.value).not.undefined;
      expect(actor?.system.ac.mod).not.undefined;
    });

    it("has aac", async () => {
      const actor = await getMockActorKey(key);
      expect(actor?.system.aac).not.undefined;
      expect(actor?.system.aac.base).not.undefined;
      expect(actor?.system.aac.naked).not.undefined;
      expect(actor?.system.aac.shield).not.undefined;
      expect(actor?.system.aac.value).not.undefined;
      expect(actor?.system.aac.mod).not.undefined;
    });

    describe("has spells", () => {
      const spellLevels = new Set(["1", "2", "3", "4", "5", "6"]);

      it("has spells", async () => {
        const actor = await getMockActorKey(key);
        expect(actor?.system.spells).not.undefined;
        expect(actor?.system.spells.enabled).not.undefined;
        expect(actor?.system.spells.spellList).not.undefined;
        expect(actor?.system.spells.slots).not.undefined;
      });

      spellLevels.forEach((lvl) => {
        it(`has spell level ${lvl}`, async () => {
          const actor = await getMockActorKey(key);
          expect(actor?.system.spells.slots[lvl]).not.undefined;
          expect(Object.keys(actor?.system.spells.slots[lvl])).contain("used");
          expect(Object.keys(actor?.system.spells.slots[lvl])).contain("max");
        });
      });
    });

    after(() => {
      cleanUpActorsByKey(key);
    });
  });

  describe("defineSchema()", () => {
    before(async () => {
      await createMockActor();
    });

    const flatFields = ["config", "initiative", "thac0", "languages"];
    flatFields.forEach((field) => {
      it(`has ${field}`, async () => {
        const actor = await getMockActorKey(key);
        expect(actor?.system[field]).not.undefined;
      });
    });

    const recursiveFields = [
      { field: "hp", subFields: ["hd", "value", "max"] },
      { field: "exploration", subFields: ["ft", "ld", "od", "sd"] },
      { field: "retainer", subFields: ["enabled", "loyalty", "wage"] },
    ];
    recursiveFields.forEach(({ field, subFields }) => {
      subFields.forEach((subField) => {
        it(`${field} field has ${subField} subfield`, async () => {
          const actor = await getMockActorKey(key);
          expect(actor?.system[field]).not.undefined;
          expect(actor?.system[field][subField]).not.undefined;
        });
      });
    });

    const doubleRecursiveFields = [
      {
        field: "saves",
        subFields: [
          { subField: "breath", subSubField: ["value"] },
          { subField: "death", subSubField: ["value"] },
          { subField: "paralysis", subSubField: ["value"] },
          { subField: "spell", subSubField: ["value"] },
          { subField: "wand", subSubField: ["value"] },
        ],
      },
    ];
    doubleRecursiveFields.forEach(({ field, subFields }) => {
      subFields.forEach(({ subField, subSubField }) => {
        it(`${field} field has ${subField} subfield, which has ${subSubField} field`, async () => {
          const actor = await getMockActorKey(key);
          expect(actor?.system[field]).not.undefined;
          expect(actor?.system[field][subField]).not.undefined;
          expect(actor?.system[field][subField][subSubField]).not.undefined;
        });
      });
    });

    after(() => {
      cleanUpActorsByKey(key);
    });
  });

  describe("usesAscendingAC()", () => {
    it("successfully reads from settings", () => {
      expect(dataModel.usesAscendingAC).equal(
        game.settings.get(game.system.id, "ascendingAC")
      );
    });
  });

  describe("meleeMod()", () => {
    describe("ascendingAC on", () => {
      before(async () => {
        await game.settings.set(game.system.id, "ascendingAC", true);
      });

      it("without scores, return 0 if bba undefined", () => {
        expect(dataModel.meleeMod).equal(0);
      });

      it("without scores, return thac0.bba when bba defined", () => {
        dataModel.thac0.bba = 12;
        expect(dataModel.meleeMod).equal(12);
        dataModel.thac0.bba = 0;
        expect(dataModel.thac0.bba).equal(0);
      });
    });

    describe("ascendingAC off", () => {
      before(async () => {
        await game.settings.set(game.system.id, "ascendingAC", false);
      });

      it("without scores, return 0", async () => {
        expect(dataModel.meleeMod).equal(0);
      });
    });

    it("adds str modifier", () => {
      dataModel.scores.str = { mod: 10 };
      expect(dataModel.meleeMod).equal(10);
      dataModel.scores.str.mod = 0;
      expect(dataModel.scores.str.mod).equal(0);
    });

    it("adds thac0 melee modifier", () => {
      dataModel.thac0.mod = { melee: 5 };
      expect(dataModel.meleeMod).equal(5);
      dataModel.thac0.mod.melee = 0;
      expect(dataModel.thac0.mod.melee).equal(0);
    });
  });

  describe("rangedMod()", () => {
    describe("ascendingAC on", () => {
      before(async () => {
        await game.settings.set(game.system.id, "ascendingAC", true);
      });

      it("without scores, return 0 if bba undefined", () => {
        expect(dataModel.rangedMod).equal(0);
      });

      it("without scores, return thac0.bba when bba defined", () => {
        dataModel.thac0.bba = 12;
        expect(dataModel.rangedMod).equal(12);
        dataModel.thac0.bba = 0;
        expect(dataModel.thac0.bba).equal(0);
      });
    });

    describe("ascendingAC off", () => {
      before(async () => {
        await game.settings.set(game.system.id, "ascendingAC", false);
      });

      it("without scores, return 0", async () => {
        expect(dataModel.rangedMod).equal(0);
      });
    });

    it("adds dex modifier", () => {
      dataModel.scores.dex = { mod: 10 };
      expect(dataModel.rangedMod).equal(10);
      dataModel.scores.dex.mod = 0;
      expect(dataModel.scores.dex.mod).equal(0);
    });

    it("adds thac0 missile modifier", () => {
      dataModel.thac0.mod = { missile: 5 };
      expect(dataModel.rangedMod).equal(5);
      dataModel.thac0.mod.missile = 0;
      expect(dataModel.thac0.mod.missile).equal(0);
    });
  });

  describe("isNew()", () => {
    it("New when all ability scores are at 0", async () => {
      const testActor = await createMockActorKey(
        "character",
        {
          system: {
            scores: {
              str: { value: 0 },
              int: { value: 0 },
              wis: { value: 0 },
              dex: { value: 0 },
              con: { value: 0 },
              cha: { value: 0 },
            },
          },
        },
        key
      );
      expect(testActor?.system.isNew).to.be.true;
    });

    it("Not new when any ability score is above 0", async () => {
      const testActor = await createMockActorKey(
        "character",
        {
          system: {
            scores: {
              str: { value: 10 },
              int: { value: 0 },
              wis: { value: 0 },
              dex: { value: 0 },
              con: { value: 0 },
              cha: { value: 0 },
            },
          },
        },
        key
      );
      expect(testActor?.system.isNew).to.be.false;
    });
  });

  describe("containers()", () => {
    it("returns all containers", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      expect(actor?.system.containers.length).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        { type: "container", name: "test container" },
      ]);
      expect(actor?.items.contents.length).equal(1);
      expect(actor?.items.contents[0].name).equal("test container");
      // eslint-disable-next-line no-underscore-dangle
      const itemId = actor?.items.contents[0].id;
      expect(actor?.system.containers.length).equal(1);
      // eslint-disable-next-line no-underscore-dangle
      expect(actor?.system.containers[0]._id).equal(itemId);
      actor?.delete();
    });

    after(() => {
      cleanUpActorsByKey(key);
    });
  });

  describe("treasures()", () => {
    it("returns treasures on actor", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      expect(actor?.system.treasures.length).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        { type: "item", name: "test treasure", system: { treasure: true } },
      ]);
      expect(actor?.items.contents.length).equal(1);
      expect(actor?.items.contents[0].name).equal("test treasure");
      expect(actor?.items.contents[0].system.treasure).is.true;
      // eslint-disable-next-line no-underscore-dangle
      const itemId = actor?.items.contents[0].id;
      expect(actor?.system.treasures.length).equal(1);
      // eslint-disable-next-line no-underscore-dangle
      expect(actor?.system.treasures[0]._id).equal(itemId);
      actor?.delete();
    });

    it("doesn't returns treasures on actor if in container", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      expect(actor?.system.treasures.length).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        { type: "container", name: "test container" },
      ]);
      const container = actor?.items.getName("test container");
      await actor?.createEmbeddedDocuments("Item", [
        // eslint-disable-next-line no-underscore-dangle
        {
          type: "item",
          name: "test treasure",
          system: { treasure: true, containerId: container?.id },
        },
      ]);
      expect(actor?.items.contents.length).equal(2);
      expect(actor?.items.contents[0].name).equal("test container");
      expect(actor?.items.contents[1].name).equal("test treasure");
      expect(actor?.items.contents[1].system.treasure).is.true;
      expect(actor?.items.contents[1].system.containerId).equal(container?.id);
      expect(actor?.system.treasures.length).equal(0);
      actor?.delete();
    });

    after(() => {
      cleanUpActorsByKey(key);
    });
  });

  describe("carriedTreasure()", () => {
    it("return treasure value on actor", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      expect(actor?.system.carriedTreasure).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        {
          type: "item",
          name: "test treasure",
          system: { treasure: true, quantity: { value: 1 }, cost: 10 },
        },
      ]);
      expect(actor?.items.contents.length).equal(1);
      expect(actor?.items.contents[0].name).equal("test treasure");
      expect(actor?.items.contents[0].system.treasure).is.true;
      expect(actor?.system.carriedTreasure).equal(10);
      actor?.delete();
    });

    it("return multiple treasure value on actor", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      expect(actor?.system.carriedTreasure).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        {
          type: "item",
          name: "test treasure",
          system: { treasure: true, quantity: { value: 1 }, cost: 10 },
        },
        {
          type: "item",
          name: "test treasure 2",
          system: { treasure: true, quantity: { value: 3 }, cost: 4 },
        },
      ]);
      expect(actor?.items.contents.length).equal(2);
      expect(actor?.items.contents[0].name).equal("test treasure");
      expect(actor?.items.contents[0].system.treasure).is.true;
      expect(actor?.items.contents[1].name).equal("test treasure 2");
      expect(actor?.items.contents[1].system.treasure).is.true;
      expect(actor?.system.carriedTreasure).equal(10 + 3 * 4);
      actor?.delete();
    });

    it("doesn't returns treasure value on actor if in container", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      expect(actor?.system.carriedTreasure).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        { type: "container", name: "test container" },
      ]);
      const container = actor?.items.getName("test container");
      await actor?.createEmbeddedDocuments("Item", [
        // eslint-disable-next-line no-underscore-dangle
        {
          type: "item",
          name: "test treasure",
          system: {
            treasure: true,
            containerId: container?.id,
            quantity: { value: 1 },
            cost: 10,
          },
        },
      ]);
      expect(actor?.items.contents.length).equal(2);
      expect(actor?.items.contents[0].name).equal("test container");
      expect(actor?.items.contents[1].name).equal("test treasure");
      expect(actor?.items.contents[1].system.treasure).is.true;
      // eslint-disable-next-line no-underscore-dangle
      expect(actor?.items.contents[1].system.containerId).equal(container?.id);
      expect(actor?.system.carriedTreasure).equal(0);
      actor?.delete();
    });

    after(() => {
      cleanUpActorsByKey(key);
    });
  });

  describe("items()", () => {
    it("only returns other items than treasure", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      expect(actor?.system.items.length).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        {
          type: "item",
          name: "test item",
        },
        {
          type: "item",
          name: "test treasure",
          system: { treasure: true, quantity: { value: 3 }, cost: 4 },
        },
      ]);
      expect(actor?.items.contents.length).equal(2);
      expect(actor?.items.contents[0].name).equal("test item");
      expect(actor?.items.contents[1].name).equal("test treasure");
      expect(actor?.items.contents[1].system.treasure).is.true;
      expect(actor?.system.items.length).equal(1);
      expect(actor?.system.items[0].name).equal("test item");
      actor?.delete();
    });

    it("only returns other items than stored in containers", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      expect(actor?.system.items.length).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        {
          type: "container",
          name: "test container",
        },
      ]);
      const container = actor?.items.getName("test container");
      await actor?.createEmbeddedDocuments("Item", [
        // eslint-disable-next-line no-underscore-dangle
        {
          type: "item",
          name: "test item in container",
          system: { containerId: container?.id },
        },
        {
          type: "item",
          name: "test item",
        },
      ]);
      expect(actor?.items.contents.length).equal(3);
      expect(actor?.items.contents[0].name).equal("test container");
      expect(actor?.items.contents[1].name).equal("test item in container");
      expect(actor?.items.contents[2].name).equal("test item");
      expect(actor?.system.items.length).equal(1);
      expect(actor?.system.items[0].name).equal("test item");
      actor?.delete();
    });
  });

  const testTypes = [
    { type: "weapon", getter: "weapons" },
    { type: "ability", getter: "abilities" },
    { type: "armor", getter: "armor" },
    { type: "spell", getter: "#spellList" },
  ];
  testTypes.forEach(({ type, getter }) => {
    describe(`${getter}()`, () => {
      it(`returns all ${getter}`, async () => {
        const actor = await createMockActor();
        expect(actor?.items.contents.length).equal(0);
        expect(actor?.system[getter].length).equal(0);
        await actor?.createEmbeddedDocuments("Item", [
          { type, name: `test ${type}` },
        ]);
        expect(actor?.items.contents.length).equal(1);
        expect(actor?.items.contents[0].name).equal(`test ${type}`);
        // eslint-disable-next-line no-underscore-dangle
        const itemId = actor?.items.contents[0].id;
        expect(actor?.system[getter].length).equal(1);
        // eslint-disable-next-line no-underscore-dangle
        expect(actor?.system[getter][0]._id).equal(itemId);
        actor?.delete();
      });

      it(`returns all ${getter} except ones in container`, async () => {
        if (getter === "abilities") return;

        const actor = await createMockActor();
        expect(actor?.items.contents.length).equal(0);
        expect(actor?.system[getter].length).equal(0);
        await actor?.createEmbeddedDocuments("Item", [
          {
            type: "container",
            name: "test container",
          },
        ]);
        const container = actor?.items.getName("test container");
        await actor?.createEmbeddedDocuments("Item", [
          // eslint-disable-next-line no-underscore-dangle
          {
            type,
            name: `test ${type} in container`,
            system: { containerId: container?.id },
          },
          {
            type,
            name: `test ${type}`,
          },
        ]);
        expect(actor?.items.contents.length).equal(3);
        expect(actor?.items.contents[0].name).equal("test container");
        expect(actor?.items.contents[1].name).equal(
          `test ${type} in container`
        );
        expect(actor?.items.contents[2].name).equal(`test ${type}`);
        // eslint-disable-next-line no-underscore-dangle
        const itemId = actor?.items.contents[2].id;
        expect(actor?.system[getter].length).equal(1);
        // eslint-disable-next-line no-underscore-dangle
        expect(actor?.system[getter][0]._id).equal(itemId);
        actor?.delete();
      });

      after(() => {
        cleanUpActorsByKey(key);
      });
    });
  });

  describe("isSlow()", () => {
    it("returns false if no weapons", async () => {
      const actor = await createMockActor();
      expect(actor?.system.isSlow).is.false;
      actor?.delete();
    });

    it("returns false if weapon that has slow tag and not equipped", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        {
          type: "weapon",
          name: "test weapon",
          system: { slow: true, equipped: false },
        },
      ]);
      expect(actor?.items.contents.length).equal(1);
      expect(actor?.items.contents[0].name).equal("test weapon");
      expect(actor?.system.isSlow).is.false;
      actor?.delete();
    });

    it("returns false if weapon that doesn't have slow tag and not equipped", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        {
          type: "weapon",
          name: "test weapon",
          system: { slow: false, equipped: true },
        },
      ]);
      expect(actor?.items.contents.length).equal(1);
      expect(actor?.items.contents[0].name).equal("test weapon");
      expect(actor?.system.isSlow).is.false;
      actor?.delete();
    });

    it("returns true if weapon that has slow tag and is equipped", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        {
          type: "weapon",
          name: "test weapon",
          system: { slow: true, equipped: true },
        },
      ]);
      expect(actor?.items.contents.length).equal(1);
      expect(actor?.items.contents[0].name).equal("test weapon");
      expect(actor?.system.isSlow).is.true;
      actor?.delete();
    });

    after(() => {
      cleanUpActorsByKey(key);
    });
  });

  describe("init()", () => {
    describe("group inititative", () => {
      before(async () => {
        await game.settings.set(game.system.id, "initiative", "group");
      });

      it("returns 0", () => {
        expect(dataModel.init).equal(0);
      });

      it("returns 0 with initiative value set", async () => {
        dataModel.initiative.value = 12;
        expect(dataModel.init).equal(0);
        dataModel.initiative.value = 0;
        expect(dataModel.initiative.value).equal(0);
      });

      it("returns 0 with initiative mod set", async () => {
        dataModel.initiative.mod = 10;
        expect(dataModel.init).equal(0);
        dataModel.initiative.mod = 0;
        expect(dataModel.initiative.mod).equal(0);
      });

      it("returns 0 with dex mod init set", async () => {
        dataModel.dex = { mod: { init: 5 } };
        expect(dataModel.init).equal(0);
        dataModel.dex.mod.init = 0;
        expect(dataModel.dex.mod.init).equal(0);
      });
    });

    describe("individual inititative", () => {
      before(async () => {
        await game.settings.set(game.system.id, "initiative", "individual");
        // @todo: tests fails if scores.dex.init isn't initiated
        // dataModel.scores.dex = { init: 0 };
      });

      it("returns 0 by default", () => {
        expect(dataModel.initiative.value).equal(0);
        expect(dataModel.initiative.mod).equal(0);
        expect(dataModel.scores.dex.init).equal(0);
        expect(dataModel.init).equal(0);
      });

      it("returns correctly with initiative value set", async () => {
        dataModel.initiative.value = 12;
        expect(dataModel.init).equal(12);
        dataModel.initiative.value = 0;
        expect(dataModel.initiative.value).equal(0);
      });

      it("returns correctly with initiative mod set", async () => {
        dataModel.initiative.mod = 10;
        expect(dataModel.init).equal(10);
        dataModel.initiative.mod = 0;
        expect(dataModel.initiative.mod).equal(0);
      });
      it("returns correctly with dex mod init set", async () => {
        dataModel.scores.dex = { init: 5 };
        expect(dataModel.init).equal(5);
        dataModel.scores.dex.init = 0;
        expect(dataModel.scores.dex.init).equal(0);
      });
    });
  });
};
