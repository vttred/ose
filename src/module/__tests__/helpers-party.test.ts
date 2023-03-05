/**
 * @file Contains tests for party helpers
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../e2e";
import {
  cleanUpActorsByKey,
  closeDialogs,
  createMockActorKey,
  openDialogs,
  waitForInput,
} from "../../e2e/testUtils";
import { update } from "../helpers-party";
import OsePartySheet from "../party/party-sheet";

export const key = "ose.helpers.party";
export const options = {
  displayName: "OSE: Helpers: Party",
};

/* MOCKING HELPERS */
const createMockActor = async (type: string, data: object = {}) =>
  createMockActorKey(type, data, key);

/* CLEAN UP HELPERS */
const cleanUpActors = () => cleanUpActorsByKey(key);

export default ({ describe, it, expect, after }: QuenchMethods) => {
  after(() => {
    cleanUpActors();
  });

  // @todo: How to test?
  describe("addControl(object, html)", () => {});

  describe("update(actor)", () => {
    it("Doesn't render a partysheet when not in party", async () => {
      const actor = await createMockActor("character");
      update(actor);
      expect(openDialogs().length).equal(0);
      await actor?.delete();
    });

    it("Opens a partysheet when in party", async () => {
      const actor = await createMockActor("character");
      actor?.setFlag(game.system.id, "party", true);
      update(actor);
      await waitForInput();
      await OsePartySheet?.partySheet?.render(true);
      await waitForInput();
      const partyMember = document
        .querySelector(".party-members .actor")
        ?.getAttribute("data-actor-id");
      expect(partyMember).equal(actor?.id);
      expect(openDialogs().length).equal(1);
      await closeDialogs();
      actor?.delete();
      expect(openDialogs().length).equal(1);
    });
  });
};
