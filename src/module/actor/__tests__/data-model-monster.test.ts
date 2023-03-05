/**
 * @file Contains tests for Monster Data Model.
 */
// eslint-disable-next-line import/no-cycle
import { QuenchMethods } from "../../../e2e";
import {
  cleanUpActorsKey,
  createMockActorKey,
  getMockActorKey,
} from "../../../e2e/testUtils";
import OseDataModelMonster from "../data-model-monster";

export const key = "ose.actor.datamodel.monster";
export const options = { displayName: "OSE: Actor: Data Model: Monster" };

const createMockActor = () => createMockActorKey("monster", {}, key);

export default ({
  describe,
  it,
  expect,
  after,
  afterEach,
  before,
}: QuenchMethods) => {
  const dataModel = new OseDataModelMonster();
  const ascendingACSetting = game.settings.get(game.system.id, "ascendingAC");
  const initiativeSetting = game.settings.get(game.system.id, "initiative");

  after(() => {
    game.settings.set(game.system.id, "ascendingAC", ascendingACSetting);
    game.settings.set(game.system.id, "initiative", initiativeSetting);
    cleanUpActorsKey(key);
  });

  // @todo: Can this be tested without creating an actor?
  describe("prepareDerivedData()", () => {
    afterEach(() => {
      cleanUpActorsKey(key);
    });

    it("doesnt have scores", async () => {
      const actor = await createMockActor();
      expect(actor?.system.scores).is.undefined;
    });

    it("has encumbrance", async () => {
      const actor = await createMockActor();
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

    it("have movement", async () => {
      const actor = await createMockActor();
      expect(actor?.system.movement).not.undefined;
      expect(actor?.system.movement.base).not.undefined;
    });

    it("have ac", async () => {
      const actor = await createMockActor();
      expect(actor?.system.ac).not.undefined;
      expect(actor?.system.ac.value).not.undefined;
      expect(actor?.system.ac.mod).not.undefined;
    });

    it("have aac", async () => {
      const actor = await createMockActor();
      expect(actor?.system.aac).not.undefined;
      expect(actor?.system.aac.value).not.undefined;
      expect(actor?.system.aac.mod).not.undefined;
    });

    describe("has spells", () => {
      // @todo: Should we keep using numbers and keys for spell levels?
      const spellLevels = new Set(["1", "2", "3", "4", "5", "6"]);

      it("has spells", async () => {
        const actor = await createMockActor();
        expect(actor?.system.spells).not.undefined;
        expect(actor?.system.spells.enabled).not.undefined;
        expect(actor?.system.spells.spellList).not.undefined;
        expect(actor?.system.spells.slots).not.undefined;
      });

      spellLevels.forEach((lvl) => {
        it(`has spell level ${lvl}`, async () => {
          const actor = await createMockActor();
          expect(actor?.system.spells.slots[lvl]).not.undefined;
          expect(Object.keys(actor?.system.spells.slots[lvl])).contain("used");
          expect(Object.keys(actor?.system.spells.slots[lvl])).contain("max");
        });
      });
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
      cleanUpActorsKey(key);
    });
  });

  describe("isNew()", () => {
    it("New when all ability scores are at 0", async () => {
      const testActor = await createMockActorKey(
        "monster",
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
        "monster",
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
      cleanUpActorsKey(key);
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
      // eslint-disable-next-line no-underscore-dangle
      expect(actor?.items.contents[1].system.containerId).equal(container?.id);
      expect(actor?.system.treasures.length).equal(0);
      actor?.delete();
    });

    after(() => {
      cleanUpActorsKey(key);
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
    // @todo: { type: "spell", getter: "#spellList" },
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
    });

    after(() => {
      cleanUpActorsKey(key);
    });
  });

  describe("attackPatterns()", () => {
    it("returns all weapons and abilities in transparent when no pattern set", async () => {
      const actor = await createMockActor();
      await actor?.createEmbeddedDocuments("Item", [
        // eslint-disable-next-line no-underscore-dangle
        {
          type: "ability",
          name: "test ability",
        },
        {
          type: "weapon",
          name: "test weapon",
        },
      ]);
      expect(Object.keys(actor?.system.attackPatterns).length).equal(1);
      expect(Object.keys(actor?.system.attackPatterns)).contain("transparent");
      expect(actor?.system.attackPatterns.transparent.length).equal(2);
      expect(actor?.system.attackPatterns.transparent[0].name).equal(
        "test weapon"
      );
      expect(actor?.system.attackPatterns.transparent[1].name).equal(
        "test ability"
      );
    });

    it("returns separated weapons and abilities whith patterns patterns", async () => {
      const actor = await createMockActor();
      await actor?.createEmbeddedDocuments("Item", [
        // eslint-disable-next-line no-underscore-dangle
        {
          type: "ability",
          name: "test ability green",
          system: { pattern: "green" },
        },
        {
          type: "weapon",
          name: "test weapon green",
          system: { pattern: "green" },
        },
        {
          type: "ability",
          name: "test ability",
        },
        {
          type: "weapon",
          name: "test weapon",
        },
      ]);
      expect(Object.keys(actor?.system.attackPatterns).length).equal(2);
      expect(Object.keys(actor?.system.attackPatterns)).contain("transparent");
      expect(Object.keys(actor?.system.attackPatterns)).contain("green");
      expect(actor?.system.attackPatterns.transparent.length).equal(2);
      expect(actor?.system.attackPatterns.transparent[0].name).equal(
        "test ability"
      );
      expect(actor?.system.attackPatterns.transparent[1].name).equal(
        "test weapon"
      );
      expect(actor?.system.attackPatterns.green.length).equal(2);
      expect(actor?.system.attackPatterns.green[0].name).equal(
        "test weapon green"
      );
      expect(actor?.system.attackPatterns.green[1].name).equal(
        "test ability green"
      );
    });
  });

  describe("isSlow()", () => {
    it("returns false if no weapons", async () => {
      const actor = await createMockActor();
      expect(actor?.system.isSlow).is.false;
      actor?.delete();
    });

    it("returns false if weapon that doesn't have slow tag", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        {
          type: "weapon",
          name: "test weapon",
          system: { slow: false },
        },
      ]);
      expect(actor?.items.contents.length).equal(1);
      expect(actor?.items.contents[0].name).equal("test weapon");
      expect(actor?.system.isSlow).is.false;
      actor?.delete();
    });

    it("returns true if weapon that has slow tag", async () => {
      const actor = await createMockActor();
      expect(actor?.items.contents.length).equal(0);
      await actor?.createEmbeddedDocuments("Item", [
        {
          type: "weapon",
          name: "test weapon",
          system: { slow: true },
        },
      ]);
      expect(actor?.items.contents.length).equal(1);
      expect(actor?.items.contents[0].name).equal("test weapon");
      expect(actor?.system.isSlow).is.true;
      actor?.delete();
    });

    after(() => {
      cleanUpActorsKey(key);
    });
  });

  describe("init()", () => {
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
};
