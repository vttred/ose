/**
 * @file Contains tests for behaviour helpers
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../e2e";
import skipRollDialogCheck from "../helpers-behaviour";

export const key = "ose.helpers.behaviour";
export const options = {
  displayName: "Helpers: Behaviour",
};

export default ({ describe, it, before, after, assert }: QuenchMethods) => {
  describe("skipRollDialogCheck(event)", () => {
    const originalSetting = game.settings.get(
      game.system.id,
      "invertedCtrlBehavior"
    );

    describe("invertedCtrlBehavior is set to false", () => {
      before(async () => {
        await game.settings.set(game.system.id, "invertedCtrlBehavior", false);
      });

      it("Setting is false", async () => {
        const setting = await game.settings.get(
          game.system.id,
          "invertedCtrlBehavior"
        );
        assert(!setting);
      });

      it("Not holding ctrl should not skip dialog", () => {
        const event = new KeyboardEvent("keydown", { ctrlKey: false });
        assert(!skipRollDialogCheck(event));
      });

      it("Not holding meta should not skip dialog", () => {
        const event = new KeyboardEvent("keydown", { metaKey: false });
        assert(!skipRollDialogCheck(event));
      });

      it("Holding ctrl should not skip dialog", () => {
        const event = new KeyboardEvent("keydown", { ctrlKey: true });
        assert(skipRollDialogCheck(event));
      });

      it("Holding meta should not skip dialog", () => {
        const event = new KeyboardEvent("keydown", { metaKey: true });
        assert(skipRollDialogCheck(event));
      });
    });

    describe("invertedCtrlBehavior is set to true", () => {
      before(async () => {
        await game.settings.set(game.system.id, "invertedCtrlBehavior", true);
      });

      it("Setting is false", async () => {
        const setting = await game.settings.get(
          game.system.id,
          "invertedCtrlBehavior"
        );
        assert(setting);
      });

      it("Not holding ctrl should skip dialog", () => {
        const event = new KeyboardEvent("keydown", { ctrlKey: false });
        assert(skipRollDialogCheck(event));
      });

      it("Not holding meta should skip dialog", () => {
        const event = new KeyboardEvent("keydown", { ctrlKey: false });
        assert(skipRollDialogCheck(event));
      });

      it("Holding ctrl should not skip dialog", () => {
        const event = new KeyboardEvent("keydown", { ctrlKey: true });
        assert(!skipRollDialogCheck(event));
      });

      it("Holding meta should not skip dialog", () => {
        const event = new KeyboardEvent("keydown", { metaKey: true });
        assert(!skipRollDialogCheck(event));
      });
    });

    after(async () => {
      await game.settings.set(
        game.system.id,
        "invertedCtrlBehavior",
        originalSetting
      );
    });
  });
};
