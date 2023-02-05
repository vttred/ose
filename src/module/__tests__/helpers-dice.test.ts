/**
 * @file Contains tests for dice helpers
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../e2e";
import { closeDialogs, trashChat, waitForInput } from "../../e2e/testUtils";
import OseDice from "../helpers-dice";

export const key = "ose.helpers.dice";
export const options = {
  displayName: "Helpers: Dice",
};

const createMockData = (type: string, target: number, thac0: number = 0) => ({
  roll: { type, target, thac0 },
});

const createMockRoll = (target: number, results: Array<number> = [target]) => ({
  terms: [{ total: target, results }],
  total: target,
});

const createMockAttackData = () => ({
  parts: ["20"],
  data: {
    roll: {
      blindroll: false,
      dmg: ["1d6"],
      thac0: 15,
      target: {
        actor: { system: { ac: { value: 0 }, aac: { value: 9 } } },
      },
    },
  },
});

export default ({
  describe,
  it,
  after,
  afterEach,
  before,
  expect,
}: QuenchMethods) => {
  const acSetting = game.settings.get(game.system.id, "ascendingAC");

  before(async () => {
    await ui.notifications?.close();
  });
  after(async () => {
    game.settings.set(game.system.id, "ascendingAC", acSetting);
    await ui.notifications?.render(true);
  });

  describe("sendRoll(parts, data, title, flavor, speaker, form, chatMessage)", () => {
    before(async () => {
      await trashChat();
    });
    it("Can roll with single part", async () => {
      const dice = await OseDice.sendRoll({
        parts: ["1d10"],
        data: { roll: { blindroll: false } },
      });
      await waitForInput();
      await waitForInput();
      const chatCard = document.querySelector(".chat-message .dice-formula")?.innerHTML;
      expect(Object.keys(dice)).contain("_evaluated");
      expect(dice._evaluated).equal(true);
      expect(Object.keys(dice)).contain("_formula");
      expect(dice._formula).equal("1d10");
      expect(chatCard).equal("1d10");
    });
    it("Can roll with multiple parts", async () => {
      const dice = await OseDice.sendRoll({
        parts: ["1d10", "1d20"],
        data: { roll: { blindroll: false } },
      });
      await waitForInput();
      await waitForInput();
      const chatCard = document.querySelector(".chat-message .dice-formula")?.innerHTML;
      expect(Object.keys(dice)).contain("_evaluated");
      expect(dice._evaluated).equal(true);
      expect(Object.keys(dice)).contain("_formula");
      expect(dice._formula).equal("1d10 + 1d20");
      expect(chatCard).equal("1d10 + 1d20");
    });
    if (game.dice3d) {
      describe("Dice So Nice integration", () => {});
    }
    afterEach(async () => {
      await trashChat();
    });
  });
  describe("digestResult(data, roll)", () => {
    describe("result type", () => {
      const data = createMockData("result", 10);
      it("Successful roll hitting target", () => {
        const roll = createMockRoll(10);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestResult(data, roll).isFailure).equal(false);
      });
      it("Unsuccessful roll under", () => {
        const roll = createMockRoll(9);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(data, roll).isFailure).equal(true);
      });
      it("Unsuccessful roll over", () => {
        const roll = createMockRoll(11);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(data, roll).isFailure).equal(true);
      });
    });
    describe("above type", () => {
      const data = createMockData("above", 10);
      it("Successful roll hitting target", () => {
        const roll = createMockRoll(10);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestResult(data, roll).isFailure).equal(false);
      });
      it("Unsuccessful roll under", () => {
        const roll = createMockRoll(9);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(data, roll).isFailure).equal(true);
      });
      it("Successful roll over", () => {
        const roll = createMockRoll(11);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestResult(data, roll).isFailure).equal(false);
      });
    });
    describe("below type", () => {
      const data = createMockData("below", 10);
      it("Successful roll hitting target", () => {
        const roll = createMockRoll(10);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestResult(data, roll).isFailure).equal(false);
      });
      it("Successful roll under", () => {
        const roll = createMockRoll(9);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestResult(data, roll).isFailure).equal(false);
      });
      it("Unsuccessful roll over", () => {
        const roll = createMockRoll(11);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(data, roll).isFailure).equal(true);
      });
    });
    describe("check type", () => {
      const data = createMockData("check", 10);
      it("Successful roll on a nat 1", () => {
        const roll = createMockRoll(1);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestResult(data, roll).isFailure).equal(false);
      });
      it("Unsuccessful roll on a nat 20", () => {
        const dataNat20 = createMockData("check", 20);
        const roll = createMockRoll(20);
        expect(OseDice.digestResult(dataNat20, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(dataNat20, roll).isFailure).equal(true);
      });
      it("Successful roll hitting target", () => {
        const roll = createMockRoll(10);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestResult(data, roll).isFailure).equal(false);
      });
      it("Successful roll under", () => {
        const roll = createMockRoll(9);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestResult(data, roll).isFailure).equal(false);
      });
      it("Unsuccessful roll over", () => {
        const roll = createMockRoll(11);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(data, roll).isFailure).equal(true);
      });
    });
    describe("table type", () => {
      const data = {
        roll: {
          type: "table",
          target: 10,
          table: {
            9: "Success",
            10: "Failure",
          },
        },
      };

      it("Successful roll hitting target", () => {
        const roll = createMockRoll(9);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(data, roll).details).equal("Success");
      });
      it("Successful roll under", () => {
        const roll = createMockRoll(10);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(data, roll).details).equal("Failure");
      });
    });
    describe("unknown type", () => {
      const data = createMockData("unknown", 10);
      it("Returns default result", () => {
        const roll = createMockRoll(4);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestResult(data, roll).target).equal(10);
        expect(OseDice.digestResult(data, roll).total).equal(4);
      });
    });
  });
  describe("attackIsSuccess(roll, thac0, ac)", () => {
    it("Natural 1 total always fails", () => {
      const roll = createMockRoll(1);
      expect(OseDice.attackIsSuccess(roll, 10, 10)).equal(false);
    });
    it("Natural 1 terms always fails", () => {
      const roll = createMockRoll(5, [1]);
      expect(OseDice.attackIsSuccess(roll, 10, 10)).equal(false);
    });
    it("Natural 20 total always succeed", () => {
      const roll = createMockRoll(20);
      expect(OseDice.attackIsSuccess(roll, 100, 10)).equal(true);
    });
    it("Natural 20+ total always succeed", () => {
      const roll = createMockRoll(21);
      expect(OseDice.attackIsSuccess(roll, 100, 10)).equal(true);
    });
    it("Natural 20 terms always succeed", () => {
      const roll = createMockRoll(5, [20]);
      expect(OseDice.attackIsSuccess(roll, 100, 10)).equal(true);
    });
    it("Roll + ac equal thac0 is successful", () => {
      const roll = createMockRoll(10);
      const thac0 = 20;
      const ac = 10;
      expect(OseDice.attackIsSuccess(roll, thac0, ac)).equal(true);
    });
    it("Roll + ac above thac0 is successful", () => {
      const roll = createMockRoll(10);
      const thac0 = 19;
      const ac = 10;
      expect(OseDice.attackIsSuccess(roll, thac0, ac)).equal(true);
    });
    it("Roll + ac under thac0 is unsuccessful", () => {
      const roll = createMockRoll(10);
      const thac0 = 21;
      const ac = 10;
      expect(OseDice.attackIsSuccess(roll, thac0, ac)).equal(false);
    });
  });
  describe("digestAttackResult(data, roll)", () => {
    const data = {
      roll: {
        thac0: 15,
        target: {
          actor: {
            system: {
              ac: { value: 0 },
              aac: { value: 9 },
            },
          },
        },
      },
    };
    describe("Ascending AC", () => {
      it("Natural 1 terms is unsuccesful", async () => {
        await game.settings.set(game.system.id, "ascendingAC", true);
        expect(game.settings.get(game.system.id, "ascendingAC")).equal(true);
        const roll = createMockRoll(1);
        expect(OseDice.digestAttackResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestAttackResult(data, roll).isFailure).equal(true);
      });
      it("Lower than target AC is unsuccesful", () => {
        const roll = createMockRoll(8);
        expect(OseDice.digestAttackResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestAttackResult(data, roll).isFailure).equal(true);
      });
      it("Equal than target AC is succesful", () => {
        const roll = createMockRoll(9);
        expect(OseDice.digestAttackResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestAttackResult(data, roll).isFailure).equal(false);
      });
      it("Higher than target AC is succesful", () => {
        const roll = createMockRoll(11);
        expect(OseDice.digestAttackResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestAttackResult(data, roll).isFailure).equal(false);
      });
      it("Natural 20 is succesful", () => {
        const roll = createMockRoll(20);
        expect(OseDice.digestAttackResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestAttackResult(data, roll).isFailure).equal(false);
      });
    });
    describe("Descending AC, ac=0", () => {
      it("Natural 1 terms is unsuccesful", async () => {
        await game.settings.set(game.system.id, "ascendingAC", false);
        expect(game.settings.get(game.system.id, "ascendingAC")).equal(false);
        const roll = createMockRoll(1);
        expect(OseDice.digestAttackResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestAttackResult(data, roll).isFailure).equal(true);
      });
      it("Lower than thac0 is unsuccesful", () => {
        const roll = createMockRoll(14);
        expect(OseDice.digestAttackResult(data, roll).isSuccess).equal(false);
        expect(OseDice.digestAttackResult(data, roll).isFailure).equal(true);
      });
      it("Equal to thac0 is succesful", () => {
        const roll = createMockRoll(15);
        expect(OseDice.digestAttackResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestAttackResult(data, roll).isFailure).equal(false);
      });
      it("Higher than thac0 is succesful", () => {
        const roll = createMockRoll(16);
        expect(OseDice.digestAttackResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestAttackResult(data, roll).isFailure).equal(false);
      });
      it("Natural 20 is succesful", () => {
        const roll = createMockRoll(20);
        expect(OseDice.digestAttackResult(data, roll).isSuccess).equal(true);
        expect(OseDice.digestAttackResult(data, roll).isFailure).equal(false);
      });
    });
  });
  describe("sendAttackRoll(parts, data, flags, title, flavor, speaker, form)", () => {
    before(async () => {
      await trashChat();
      await game.settings.set(game.system.id, "ascendingAC", true);
    });
    it("Missing dmg roll shows notification", async () => {
      ui.notifications?.close();
      const rollData = createMockAttackData();
      rollData.data.roll.dmg = [];
      await OseDice.sendAttackRoll(rollData);
      await waitForInput();
      await waitForInput();
      const notification = ui.notifications?.queue.pop();
      expect(ui.notifications?.queue.length).equal(0);
      expect(notification?.message).equal(
        "Attack has no damage dice terms; be sure to set the attack's damage"
      );
    });
    it("Can roll with single part and single dmg die", async () => {
      const rollData = createMockAttackData();
      await OseDice.sendAttackRoll(rollData);
      await waitForInput();
      await waitForInput();
      const attackResult = document.querySelector(".roll-result b").innerHTML;
      expect(attackResult).equal("Hits AC 20!");
      const attackDiceResult = document.querySelector(".dice-formula").innerHTML;
      expect(attackDiceResult).equal("20");
      const damageDiceResult = document.querySelector(".damage-roll .dice-formula").innerHTML;
      expect(damageDiceResult).equal("1d6");
    });
    it("Can roll with single part and multiple dmg dice", async () => {
      const rollData = createMockAttackData();
      rollData.data.roll.dmg = ["1d6", "1d100"];
      await OseDice.sendAttackRoll(rollData);
      await waitForInput();
      await waitForInput();
      const attackResult = document.querySelector(".roll-result b").innerHTML;
      expect(attackResult).equal("Hits AC 20!");
      const attackDiceResult = document.querySelector(".dice-formula").innerHTML;
      expect(attackDiceResult).equal("20");
      const damageDiceResult = document.querySelector(".damage-roll .dice-formula").innerHTML;
      expect(damageDiceResult).equal("1d6 + 1d100");
    });
    it("Can roll with multiple parts and single dmg die", async () => {
      const rollData = createMockAttackData();
      rollData.parts = ["1d20", "1d10", "30"];
      await OseDice.sendAttackRoll(rollData);
      await waitForInput();
      await waitForInput();
      const attackResult = document.querySelector(".roll-result b").innerHTML;
      expect(attackResult).contain("Hits AC");
      const attackDiceResult = document.querySelector(".dice-formula").innerHTML;
      expect(attackDiceResult).equal("1d20 + 1d10 + 30");
      const damageDiceResult = document.querySelector(".damage-roll .dice-formula").innerHTML;
      expect(damageDiceResult).equal("1d6");
    });
    it("Can roll with multiple parts and single dmg die", async () => {
      const rollData = createMockAttackData();
      rollData.parts = ["1d20", "1d10", "300"];
      await OseDice.sendAttackRoll(rollData);
      await waitForInput();
      await waitForInput();
      const attackResult = document.querySelector(".roll-result b").innerHTML;
      expect(attackResult).contain("Hits AC");
      const attackDiceResult = document.querySelector(".dice-formula").innerHTML;
      expect(attackDiceResult).equal("1d20 + 1d10 + 300");
      const damageDiceResult = document.querySelector(".damage-roll .dice-formula").innerHTML;
      expect(damageDiceResult).equal("1d6");
    });
    it("Can roll with multiple parts and multiple dmg dice", async () => {
      const rollData = createMockAttackData();
      rollData.parts = ["1d20", "1d10", "30"];
      rollData.data.roll.dmg = ["1d6", "1d100"];
      await OseDice.sendAttackRoll(rollData);
      await waitForInput();
      await waitForInput();
      const attackResult = document.querySelector(".roll-result b").innerHTML;
      expect(attackResult).contain("Hits AC");
      const attackDiceResult = document.querySelector(".dice-formula").innerHTML;
      expect(attackDiceResult).equal("1d20 + 1d10 + 30");
      const damageDiceResult = document.querySelector(".damage-roll .dice-formula").innerHTML;
      expect(damageDiceResult).equal("1d6 + 1d100");
    });
    if (game.dice3d) {
      describe("Dice So Nice integration", () => {});
    }
    afterEach(async () => {
      await trashChat();
    });
  });
  describe("RollSave(parts, data, skipDialog, speaker, flavor, title, chatMessage)", () => {
    describe("Skipping dialog", () => {
      const skipDialog = true;
      it("produces a roll chat message", async () => {
        await OseDice.RollSave({
          parts: ["1d10"],
          skipDialog,
          data: { roll: { blindroll: false } },
        });
        await waitForInput();
        expect(game.messages.size).equal(1);
        expect(document.querySelector(".roll-result")).not.undefined;
      });
    });
    describe("Not skipping dialog", () => {
      it("produces a dialog", async () => {
        OseDice.RollSave({
          parts: ["1d10"],
          data: { roll: { blindroll: false } },
        });
        await waitForInput();
        const dialog = document.querySelector(".dialog");
        expect(dialog?.querySelector(".ok")).not.null;
        expect(dialog?.querySelector(".magic")).not.null;
        expect(dialog?.querySelector(".cancel")).not.null;
        await closeDialogs();
      });
    });
    afterEach(async () => {
      await trashChat();
      await closeDialogs();
    });
  });
  describe("Roll(parts, data, skipDialog, speaker, flavor, title, chatMessage, flags)", () => {
    describe("Skipping dialog", () => {
      const skipDialog = true;
      it("produces a roll chat message", async () => {
        await OseDice.Roll({
          parts: ["1d10"],
          skipDialog,
          data: { roll: { blindroll: false } },
        });
        await waitForInput();
        expect(game.messages.size).equal(1);
        expect(document.querySelector(".roll-result")).not.undefined;
      });
    });
    describe("Not skipping dialog", () => {
      it("produces a dialog", async () => {
        OseDice.Roll({
          parts: ["1d10"],
          data: { roll: { blindroll: false } },
        });
        await waitForInput();
        const dialog = document.querySelector(".dialog");
        expect(dialog?.querySelector(".ok")).not.null;
        expect(dialog?.querySelector(".magic")).is.null;
        expect(dialog?.querySelector(".cancel")).not.null;
        await closeDialogs();
      });
    });
    afterEach(async () => {
      await trashChat();
      await closeDialogs();
      await waitForInput();
    });
  });
};
