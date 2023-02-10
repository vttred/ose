/**
 * @file Contains tests for chat helpers
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../e2e";
import {
  addChatMessageButtons,
  addChatMessageContextOptions,
  functionsForTesting,
} from "../helpers-chat";

const { applyChatCardDamage } = functionsForTesting;

export const key = "ose.helpers.chat";
export const options = {
  displayName: "Helpers: Chat",
};

export default ({ describe, it, before, after, expect }: QuenchMethods) => {
  // @todo: How do we test these properly?
  describe("applyChatCardDamage(roll, multiplier)", () => {});
  describe("addChatMessageContextOptions(_, options)", () => {});
  describe("addChatMessageButtons(msg. html)", () => {});
};
