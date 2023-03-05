// eslint-disable-next-line eslint-comments/disable-enable-pair

/* eslint-disable simple-import-sort/imports */

/**
 * @file Contains tests for Actor Entity.
 */
// eslint-disable-next-line import/no-cycle
import OseItem from "../../item/entity";

import * as e2e from "../../../e2e";
import {
  cleanUpActorsKey,
  cleanUpScenes,
  cleanUpWorldItems,
  createMockScene,
  createWorldTestItem,
  itemTypes,
  trashChat,
  waitForInput,
} from "../../../e2e/testUtils";
import OseActor from "../entity";

export const key = "ose.entity.actor";
export const options = {
  displayName: "Entity: Actor (long)",
  preSelected: false,
};

const createMockActor = async (type: string) =>
  OseActor.create({
    name: `Test Actor ${key}`,
    type,
  });

export default ({
  describe,
  it,
  expect,
  after,
  afterEach,
  before,
  assert,
}: e2e.QuenchMethods) => {
  afterEach(async () => {
    await trashChat();
    cleanUpActorsKey(key);
    cleanUpWorldItems();
  });

  describe("update(data, options)", () => {
    // @todo: Write tests
    it("AAC to AC", async () => {
      const actor = await createMockActor("character");
      expect(actor?.system.ac.value).equal(12);
      expect(actor?.system.aac.value).equal(7);
      await actor?.system.update({ ac: { value: 15 } });
      await waitForInput();
      expect(actor?.system.ac.value).equal(15);
      expect(actor?.system.aac.value).equal(19 - 15);
    });

    it("AC to AAC", async () => {
      const actor = await createMockActor("character");
      expect(actor?.system.ac.value).equal(12);
      expect(actor?.system.aac.value).equal(7);
      await actor?.system.update({ aac: { value: 15 } });
      await waitForInput();
      expect(actor?.system.aac.value).equal(15);
      expect(actor?.system.ac.value).equal(19 - 15);
    });

    it("THAC0 to BBA", async () => {
      const actor = await createMockActor("character");
      expect(actor?.system.thac0.value).equal(12);
      expect(actor?.system.thac0.value).equal(7);
      await actor?.system.update({ thac0: { value: 15 } });
      await waitForInput();
      expect(actor?.system.thac0.value).equal(15);
      expect(actor?.system.thac0.value).equal(19 - 15);
    });

    it("BBA to THAC0", async () => {
      const actor = await createMockActor("character");
      expect(actor?.system.thac0.value).equal(12);
      expect(actor?.system.thac0.value).equal(7);
      await actor?.system.update({ thac0: { bba: 15 } });
      await waitForInput();
      expect(actor?.system.thac0.value).equal(15);
      expect(actor?.system.thac0.value).equal(19 - 15);
    });
  });

  describe("createEmbeddedDocuments(embeddedName, data, context)", () => {
    after(async () => {
      game.items
        ?.filter((i) => i?.name?.indexOf(`Test ${key}`) >= 0)
        .forEach((i) => i.delete());
    });
    itemTypes.forEach((itemType) => {
      it(`Creates ${itemType.capitalize()} with correct default icon`, async () => {
        const actor = await createMockActor("character");
        const item = (await OseItem.create({
          name: `Test ${key} ${itemType.capitalize()}`,
          type: itemType,
        })) as OseItem;
        await actor?.createEmbeddedDocuments("Item", [item]);
        const actorItem = actor?.items.getName(item?.name);
        expect(actorItem?.img).equal(OseItem.defaultIcons[itemType]);
        item?.delete();
      });
    });
  });

  describe("getExperience(value, options)", () => {
    afterEach(async () => {
      await trashChat();
    });

    it("Adding positive XP adds to experience", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      expect(actor?.system.details.xp.value).equal(0);
      expect(game.messages?.size).equal(0);
      await actor?.getExperience(10);
      expect(actor?.system.details.xp.value).equal(10);
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor?.delete();
    });

    it("Adding negative XP subtracts from experience", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      expect(actor?.system.details.xp.value).equal(0);
      expect(game.messages?.size).equal(0);
      await actor?.getExperience(-10);
      expect(actor?.system.details.xp.value).equal(-10);
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor?.delete();
    });

    it("Adding positive XP adds to experience modified by bonus", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor?.update({ system: { details: { xp: { bonus: 10 } } } });
      expect(actor?.system.details.xp.value).equal(0);
      expect(game.messages?.size).equal(0);
      await actor?.getExperience(10);
      expect(actor?.system.details.xp.value).equal(11);
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor?.delete();
    });
  });

  describe("isNew()", () => {
    it("character", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      expect(actor?.isNew()).equal(true);
      await actor?.delete();
    });

    it("monster", async () => {
      const actor = (await createMockActor("monster")) as OseActor;
      expect(actor?.isNew()).equal(true);
      await actor?.delete();
    });
  });

  describe("generateSave(hd)", async () => {
    const saves = [
      {
        low: -99,
        high: 1,
        death: 14,
        wands: 15,
        paralysis: 16,
        breath: 17,
        spell: 18,
      },
      {
        low: 1,
        high: 3,
        death: 12,
        wands: 13,
        paralysis: 14,
        breath: 15,
        spell: 16,
      },
      {
        low: 4,
        high: 6,
        death: 10,
        wands: 11,
        paralysis: 12,
        breath: 13,
        spell: 14,
      },
      {
        low: 7,
        high: 9,
        death: 8,
        wands: 9,
        paralysis: 10,
        breath: 10,
        spell: 12,
      },
      {
        low: 10,
        high: 12,
        death: 6,
        wands: 7,
        paralysis: 8,
        breath: 8,
        spell: 10,
      },
      {
        low: 10,
        high: 12,
        death: 6,
        wands: 7,
        paralysis: 8,
        breath: 8,
        spell: 10,
      },
      {
        low: 13,
        high: 15,
        death: 4,
        wands: 5,
        paralysis: 6,
        breath: 5,
        spell: 8,
      },
      {
        low: 16,
        high: 18,
        death: 2,
        wands: 3,
        paralysis: 4,
        breath: 3,
        spell: 6,
      },
      {
        low: 19,
        high: 21,
        death: 2,
        wands: 2,
        paralysis: 2,
        breath: 2,
        spell: 4,
      },
      {
        low: 22,
        high: 99,
        death: 2,
        wands: 2,
        paralysis: 2,
        breath: 2,
        spell: 2,
      },
    ];

    const thac0 = [
      { low: -100, high: 0, value: 20 },
      { low: 0, high: 1, value: 19 },
      { low: 1, high: 2, value: 18 },
      { low: 2, high: 3, value: 17 },
      { low: 3, high: 4, value: 16 },
      { low: 4, high: 5, value: 15 },
      { low: 5, high: 6, value: 14 },
      { low: 6, high: 7, value: 13 },
      { low: 7, high: 9, value: 12 },
      { low: 9, high: 11, value: 11 },
      { low: 11, high: 13, value: 1 },
      { low: 13, high: 15, value: 9 },
      { low: 15, high: 17, value: 8 },
      { low: 17, high: 19, value: 7 },
      { low: 19, high: 21, value: 6 },
      { low: 21, high: 100, value: 5 },
    ];

    const scoreSpread = Array.from({ length: 23 }, (_el, idx) => idx + 1);

    const actor = (await createMockActor("monster")) as OseActor;

    scoreSpread.forEach((hd) => {
      const savesData = saves.find((s) => hd >= s.low && hd <= s.high);
      const thac0Data = thac0.find((s) => hd >= s.low && hd <= s.high);
      const thac0PlusData = thac0.find(
        (s) => hd + 1 >= s.low && hd + 1 <= s.high
      );
      actor?.generateSave(`${hd}`);

      it(`hd ${hd} generates correct saves`, () => {
        expect(actor?.system.saves.death.value).equal(savesData?.death);
        expect(actor?.system.saves.wand.value).equal(savesData?.wands);
        expect(actor?.system.saves.paralysis.value).equal(savesData?.paralysis);
        expect(actor?.system.saves.breath.value).equal(savesData?.breath);
        expect(actor?.system.saves.spell.value).equal(savesData?.spell);
      });

      it(`hd ${hd} generates correct thac0`, () => {
        expect(actor?.system.thac0.value).equal(thac0Data?.value);
        expect(actor?.system.thac0.bba).equal(19 - thac0Data?.value);
      });

      actor?.generateSave(`${hd}+`);
      it(`hd ${hd}+ generates correct thac0`, () => {
        expect(actor?.system.thac0.value).equal(thac0PlusData?.value);
        expect(actor?.system.thac0.bba).equal(19 - thac0PlusData?.value);
      });
    });

    await actor?.delete();
  });

  describe("rollHP(options)", async () => {
    const actor = (await createMockActor("monster")) as OseActor;
    const conScoreSpread = Array.from({ length: 20 }, (_el, idx) => idx + 1);
    const conBonusSpread = [
      -3, -3, -3, -2, -2, -1, -1, -1, 0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 3,
    ];
    const hdSpread = [4, 6, 8, 10, 12, 20];
    conScoreSpread.forEach((con, idx) => {
      hdSpread.forEach((hd) => {
        it(`${hd} hd with ${con} Con correctly rolls HP`, async () => {
          await actor?.update({
            system: { hp: { hd: `1d${hd}` }, scores: { con: { value: con } } },
          });
          await actor?.rollHP();
          assert(actor?.system.hp.max - conBonusSpread[idx] >= 1);
          assert(actor?.system.hp.value - conBonusSpread[idx] >= 1);
          assert(actor?.system.hp.max - conBonusSpread[idx] >= hd);
          assert(actor?.system.hp.value - conBonusSpread[idx] >= hd);
        });
      });
    });
    await actor?.delete();
  });

  describe("rollSave(save, options)", () => {
    afterEach(async () => {
      await trashChat();
    });

    const saves = ["death", "wand", "paralysis", "breath", "spell"];
    saves.forEach((save) => {
      it(`is functional for ${save} saves on character`, async () => {
        const actor = (await createMockActor("character")) as OseActor;
        expect(game.messages?.size).equal(0);
        await actor?.rollSave(save, { fastForward: true });
        await waitForInput();
        expect(game.messages?.size).equal(1);
        await actor?.delete();
      });

      it(`is functional for ${save} saves on monster`, async () => {
        const actor = (await createMockActor("monster")) as OseActor;
        expect(game.messages?.size).equal(0);
        await actor.rollSave(save, { fastForward: true });
        await waitForInput();
        expect(game.messages?.size).equal(1);
        await actor?.delete();
      });
    });
  });

  describe("rollMorale(options)", () => {
    afterEach(async () => {
      await trashChat();
    });

    it("for character", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      expect(game.messages?.size).equal(0);
      await actor.rollMorale();
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor?.delete();
    });

    it("for monster", async () => {
      const actor = (await createMockActor("monster")) as OseActor;
      expect(game.messages?.size).equal(0);
      await actor.rollMorale();
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor?.delete();
    });
  });

  describe("rollLoyalty(options)", () => {
    afterEach(async () => {
      await trashChat();
    });

    it("for character", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      expect(game.messages?.size).equal(0);
      await actor.rollLoyalty();
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor?.delete();
    });

    it("for monster", async () => {
      const actor = (await createMockActor("monster")) as OseActor;
      expect(game.messages?.size).equal(0);
      await actor.rollLoyalty();
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor?.delete();
    });
  });

  describe("rollReaction(options)", () => {
    afterEach(async () => {
      await trashChat();
    });

    it("for character", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      expect(game.messages?.size).equal(0);
      await actor.rollReaction({ fastForward: true });
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor.delete();
    });

    it("for monster", async () => {
      const actor = (await createMockActor("monster")) as OseActor;
      expect(game.messages?.size).equal(0);
      await actor.rollReaction({ fastForward: true });
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor.delete();
    });
  });

  describe("rollCheck(score, options)", () => {
    const scores = ["str", "int", "dex", "wis", "con", "cha"];

    afterEach(async () => {
      await trashChat();
    });

    scores.forEach((score) => {
      it(`${score} for character`, async () => {
        const actor = (await createMockActor("character")) as OseActor;
        expect(game.messages?.size).equal(0);
        await actor.rollCheck(score, { fastForward: true });
        await waitForInput();
        expect(game.messages?.size).equal(1);
        await actor.delete();
      });

      it(`${score} for character`, async () => {
        const actor = (await createMockActor("monster")) as OseActor;
        expect(game.messages?.size).equal(0);
        await actor.rollCheck(score, { fastForward: true });
        await waitForInput();
        expect(game.messages?.size).equal(0);
        await actor.delete();
      });
    });
  });

  describe("rollHitDice(options)", () => {
    const conScoreSpread = Array.from({ length: 20 }, (_el, idx) => idx + 1);
    const conBonusSpread = [
      -3, -3, -3, -2, -2, -1, -1, -1, 0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 3,
    ];
    const levelSpread = Array.from({ length: 9 }, (_el, idx) => idx + 1);

    conScoreSpread.forEach((con, idx) => {
      const conMod = conBonusSpread[idx];
      const expectedTerms = conMod >= 0 ? 5 : 6;
      const modSign = conMod < 0 ? "-" : "+";
      const modUnsigned = modSign === "-" ? conMod * -1 : conMod;
      levelSpread.forEach((level) => {
        it(`constructs the roll terms correctly with level ${level} and con ${con}`, async () => {
          const actor = (await createMockActor("character")) as OseActor;
          await actor?.update({
            system: { details: { level }, scores: { con: { value: con } } },
          });
          const roll = await actor.rollHitDice();

          expect(roll.terms.length).equal(expectedTerms);
          expect(roll.terms[0].expression).equal(actor?.system.hp.hd);
          if (conMod < 0) {
            expect(roll.terms[expectedTerms - 5].operator).equal("+");
          }
          expect(roll.terms[expectedTerms - 4].operator).equal(modSign);
          expect(roll.terms[expectedTerms - 3].expression).equal(
            modUnsigned.toString()
          );
          expect(roll.terms[expectedTerms - 2].operator).equal("+");
          expect(roll.terms[expectedTerms - 1].expression).equal(
            level.toString()
          );
          expect(actor?.system.scores.con.mod).equal(conMod);
          await actor?.delete();
        });
      });
    });
  });

  describe("rollAppearing(options)", () => {
    afterEach(async () => {
      await trashChat();
    });

    it("for character", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      expect(game.messages?.size).equal(0);
      await actor.rollAppearing();
      await waitForInput();
      expect(game.messages?.size).equal(0);
      await actor.delete();
    });

    describe("for monster", () => {
      it("in wilderness", async () => {
        const actor = (await createMockActor("monster")) as OseActor;
        expect(game.messages?.size).equal(0);
        await actor.rollAppearing({ check: "wilderness" });
        await waitForInput();
        expect(game.messages?.size).equal(1);
        expect(game.messages?.contents[0].content).contain(
          game.i18n.format("OSE.roll.appearing", { type: "(2)" })
        );
        await actor.delete();
      });

      it("in other", async () => {
        const actor = (await createMockActor("monster")) as OseActor;
        expect(game.messages?.size).equal(0);
        await actor.rollAppearing({ check: "other" });
        await waitForInput();
        expect(game.messages?.size).equal(1);
        expect(game.messages?.contents[0].content).contain(
          game.i18n.format("OSE.roll.appearing", { type: "(1)" })
        );
        await actor.delete();
      });
    });
  });

  describe("rollExploration(expl, options)", () => {
    afterEach(async () => {
      await trashChat();
    });

    const explorationOptions = ["ld", "od", "sd", "fs"];
    explorationOptions.forEach((expl) => {
      it("for character", async () => {
        const actor = (await createMockActor("character")) as OseActor;
        expect(game.messages?.size).equal(0);
        await actor.rollExploration(expl, { fastForward: true });
        await waitForInput();
        expect(game.messages?.contents[0].content).contain(
          game.i18n.format("OSE.roll.exploration", {
            exploration: game.i18n.localize(`OSE.exploration.${expl}.long`),
          })
        );
        await actor.delete();
      });
    });

    it("for monster", async () => {
      const actor = (await createMockActor("monster")) as OseActor;
      expect(game.messages?.size).equal(0);
      await actor.rollExploration("ld", { fastForward: true });
      await waitForInput();
      expect(game.messages?.size).equal(0);
      await actor.delete();
    });
  });

  describe("rollDamage(attData, options)", () => {
    afterEach(async () => {
      await trashChat();
    });

    it("for character", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      expect(game.messages?.size).equal(0);
      await actor.rollDamage({ label: "test" });
      await waitForInput();
      expect(game.messages?.size).equal(1);
      expect(game.messages?.contents[0].content).contain(
        `test - ${game.i18n.localize("OSE.Damage")}`
      );
      await actor.delete();
    });

    it("for monster", async () => {
      const actor = (await createMockActor("monster")) as OseActor;
      expect(game.messages?.size).equal(0);
      await actor.rollDamage({ label: "test" });
      await waitForInput();
      expect(game.messages?.size).equal(1);
      expect(game.messages?.contents[0].content).contain(
        `test - ${game.i18n.localize("OSE.Damage")}`
      );
      await actor.delete();
    });

    it("Adds roll.dmg to damage parts if provided", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      expect(game.messages?.size).equal(0);
      await actor.rollDamage({
        label: "test",
        roll: { dmg: "15" },
      });
      await waitForInput();
      expect(game.messages?.size).equal(1);
      expect(game.messages?.contents[0].content).contain(
        `test - ${game.i18n.localize("OSE.Damage")}`
      );
      expect(game.messages?.contents[0].content).contain("15");
      await actor.delete();
    });

    it("Adds strength bonus if melee damage roll", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor?.update({ system: { scores: { str: { value: 1 } } } });
      expect(actor.system.scores.str.value).equal(1);
      expect(game.messages?.size).equal(0);
      await actor.rollDamage({
        label: "test",
        roll: { dmg: "15", type: "melee" },
      });
      await waitForInput();
      expect(game.messages?.size).equal(1);
      expect(game.messages?.contents[0].content).contain(
        `test - ${game.i18n.localize("OSE.Damage")}`
      );
      expect(game.messages?.contents[0].content).contain("15 +  - 3");
      await actor.delete();
    });
  });

  describe("targetAttack(data, type, options)", () => {
    before(async () => {
      const scene = await createMockScene();
      await scene?.activate();
    });

    afterEach(async () => {
      await trashChat();
    });

    it("One target causes one attack roll", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      const token = await actor.getTokenDocument();
      await canvas.scene?.createEmbeddedDocuments("Token", [token]);
      await waitForInput();
      expect(game.user?.targets.size).equal(0);
      canvas.tokens?.placeables.forEach((t) =>
        t.setTarget(true, { releaseOthers: false, groupSelection: true })
      );
      expect(canvas.tokens?.placeables[0].actor).not.null;
      expect(canvas.tokens?.placeables[0].actor?.system.ac.value).not.null;
      expect(game.user?.targets.size).equal(1);
      expect(game.messages?.size).equal(0);
      await actor.targetAttack({ roll: { target: {} } }, "melee", {
        skipDialog: true,
      });
      await waitForInput();
      expect(game.messages?.size).equal(1);
      canvas.tokens?.placeables[0].setTarget(false, { releaseOthers: true });
      expect(game.user?.targets.size).equal(0);
      await actor.delete();
    });

    it("Multiple target causes multiple attack rolls", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      const token = await actor.getTokenDocument();
      await canvas.scene?.createEmbeddedDocuments("Token", [token]);
      await waitForInput();
      expect(game.user?.targets.size).equal(0);
      canvas.tokens?.placeables.forEach((t) =>
        t.setTarget(true, { releaseOthers: false, groupSelection: true })
      );
      expect(game.user?.targets.size).equal(2);
      expect(game.messages?.size).equal(0);
      await actor.targetAttack({ roll: { target: {} } }, "melee", {
        skipDialog: true,
      });
      await waitForInput();
      expect(game.messages?.size).equal(2);
      canvas.tokens?.placeables[0].setTarget(false, { releaseOthers: true });
      expect(game.user?.targets.size).equal(0);
      await actor.delete();
    });

    it("If no target is given, just roll attack", async () => {
      const data = {
        roll: {
          blindroll: false,
          dmg: ["1d6"],
          thac0: 15,
          target: {
            actor: { system: { ac: { value: 0 }, aac: { value: 9 } } },
          },
        },
      };
      const actor = (await createMockActor("character")) as OseActor;
      expect(game.user?.targets.size).equal(0);
      expect(game.messages?.size).equal(0);
      await actor.targetAttack(data, "melee", { skipDialog: true });
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor.delete();
    });

    after(() => {
      cleanUpScenes();
    });
  });

  describe("rollAttack(attdata, options)", () => {
    before(async () => {
      await trashChat();
    });

    afterEach(async () => {
      await trashChat();
    });

    it("rolls a d20 if supplied no data", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      expect(game.messages?.size).equal(0);
      const rolldata = await actor.rollAttack(
        { roll: {} },
        { skipDialog: true }
      );
      expect(rolldata.formula).equal("1d20");
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor.delete();
    });

    it("Provided an item, adds item damage to dmgParts", async () => {
      // @todo: How to verify the item is being rolled?
      /* const actor = await createMockActor("character");
      const item = await createWorldTestItem("weapon");
      expect(item?.system.damage).is.not.undefined;
      expect(game.messages?.size).equal(0);
      const rolldata = await actor.rollAttack({ roll: {}, item }, { skipDialog: true });
      expect(rolldata.formula).equal("1d20");
      await waitForInput();
      expect(game.messages?.size).equal(1);
      actor?.delete();
      item?.delete(); */
    });

    it("If missile attack, add dex mod to attack roll", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      expect(game.messages?.size).equal(0);
      const rolldata = await actor.rollAttack(
        { roll: {} },
        { type: "missile", skipDialog: true }
      );
      expect(rolldata.formula).equal("1d20 +  - 3 + 0");
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor.delete();
    });

    it("If melee attack, add str mod to attack roll", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor.update({ system: { scores: { str: { value: 18 } } } });
      expect(game.messages?.size).equal(0);
      const rolldata = await actor.rollAttack(
        { roll: {} },
        { type: "melee", skipDialog: true }
      );
      expect(rolldata.formula).equal("1d20 + 3 + 0");
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor.delete();
    });

    // @todo: How to verify if possible to miss, thus obfuscating dmg roll?
    it("If melee attack, add str mod to damage roll", async () => {});

    it("If item provided with a bonus, it is added as bonus to attack roll", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      const item = await createWorldTestItem("weapon");
      await item?.update({ system: { bonus: 18 } });
      expect(game.messages?.size).equal(0);
      const rolldata = await actor.rollAttack(
        { roll: {}, item },
        { skipDialog: true }
      );
      expect(rolldata.formula).equal("1d20 + 18");
      await waitForInput();
      expect(game.messages?.size).equal(1);
      await actor.delete();
    });
  });

  describe("applyDamage(amount, multiplier)", () => {
    it("doesn't remove hp if no variables are given", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor.update({ system: { hp: { value: 10, max: 10 } } });
      expect(actor.system.hp.value).equal(10);
      await actor.applyDamage();
      expect(actor.system.hp.value).equal(10);
      await actor.delete();
    });

    it("calculates the amount with amount", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor.update({ system: { hp: { value: 10, max: 10 } } });
      expect(actor.system.hp.value).equal(10);
      await actor.applyDamage(3);
      expect(actor.system.hp.value).equal(7);
      await actor.delete();
    });

    it("calculates the amount with amount and multiplier", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor.update({ system: { hp: { value: 10, max: 10 } } });
      expect(actor.system.hp.value).equal(10);
      await actor.applyDamage(3, 2);
      expect(actor.system.hp.value).equal(4);
      await actor.delete();
    });

    it("calculates the amount with amount and negative multiplier", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor.update({ system: { hp: { value: 1, max: 10 } } });
      expect(actor.system.hp.value).equal(1);
      await actor.applyDamage(3, -2);
      expect(actor.system.hp.value).equal(7);
      await actor.delete();
    });

    it("calculates the amount with negative amount", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor.update({ system: { hp: { value: 1, max: 10 } } });
      expect(actor.system.hp.value).equal(1);
      await actor.applyDamage(-3);
      expect(actor.system.hp.value).equal(4);
      await actor.delete();
    });

    it("doesn't reduce lower than 0 hp with only amount", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor.update({ system: { hp: { value: 10, max: 10 } } });
      expect(actor.system.hp.value).equal(10);
      await actor.applyDamage(20);
      expect(actor.system.hp.value).equal(0);
      await actor.delete();
    });

    it("doesn't reduce lower than 0 hp with amount and multiplier", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor.update({ system: { hp: { value: 10, max: 10 } } });
      expect(actor.system.hp.value).equal(10);
      await actor.applyDamage(4, 3);
      expect(actor.system.hp.value).equal(0);
      await actor.delete();
    });

    it("doesn't increase higher than max hp with only amount", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor.update({ system: { hp: { value: 1, max: 10 } } });
      expect(actor.system.hp.value).equal(1);
      await actor.applyDamage(-20);
      expect(actor.system.hp.value).equal(10);
      await actor.delete();
    });

    it("doesn't increase higher than max hp with amount and multiplier", async () => {
      const actor = (await createMockActor("character")) as OseActor;
      await actor.update({ system: { hp: { value: 1, max: 10 } } });
      expect(actor.system.hp.value).equal(1);
      await actor.applyDamage(4, -3);
      expect(actor.system.hp.value).equal(10);
      await actor.delete();
    });
  });
};
