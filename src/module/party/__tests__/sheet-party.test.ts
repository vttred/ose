/**
 * @file Contains tests for Party Sheet.
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../../e2e";
import {
  cleanUpActorsKey,
  createMockActorKey,
  openWindows,
  waitForInput,
} from "../../../e2e/testUtils";
import OsePartySheet from "../party-sheet";

export const key = "ose.sheet.party";
export const options = { displayName: "Sheet: Party" };

const createMockActor = async (type: string, data: object = {}) =>
  createMockActorKey(type, data, key);

export default ({ describe, it, expect, assert, after }: QuenchMethods) => {
  describe("defaultOptions()", () => {
    it("Has correctly set defaultOptions", () => {
      const partySheet = new OsePartySheet();
      expect(partySheet.options.classes).contain("ose");
      expect(partySheet.options.classes).contain("dialog");
      expect(partySheet.options.classes).contain("party-sheet");
      expect(partySheet.options.template).contain(
        "/templates/apps/party-sheet.html"
      );
      expect(partySheet.options.width).equal(280);
      expect(partySheet.options.height).equal(400);
      assert(partySheet.options.resizable);
      expect(partySheet.options.dragDrop[0].dragSelector).equal(
        ".actor-list .actor"
      );
      expect(partySheet.options.dragDrop[0].dropSelector).equal(
        ".party-members"
      );
      assert(!partySheet.options.closeOnSubmit);
    });
  });

  // @todo: How to test?
  describe("init()", () => {});

  describe("showPartySheet(options = {})", () => {
    it("Can render party sheet", async () => {
      OsePartySheet.showPartySheet();
      await waitForInput();
      const dialogs = openWindows("party-sheet");
      expect(dialogs.length).equal(1);
      expect(dialogs[0].options.classes).contain("party-sheet");
      await dialogs[0].close();
      expect(openWindows("party-sheet").length).equal(0);
    });
  });

  describe("partySheet()", () => {
    it("Returns a partysheet", () => {
      const { partySheet } = OsePartySheet;
      expect(partySheet).is.not.undefined;
      expect(partySheet?.options.classes).contain("party-sheet");
    });
  });

  describe("title()", () => {
    it("Creates string in dialog window title", async () => {
      OsePartySheet.showPartySheet();
      await waitForInput();
      const dialogTitle = document.querySelector(
        "div.party-sheet .window-title"
      )?.innerHTML;
      expect(typeof dialogTitle).equal("string");
      const dialogs = openWindows("party-sheet");
      expect(dialogs.length).equal(1);
      await dialogs[0].close();
      expect(openWindows("party-sheet").length).equal(0);
    });
  });

  describe("getData()", () => {
    it("Returns proper data", () => {
      const sheet = new OsePartySheet();
      const data = sheet.getData();
      const keys = Object.keys(data);
      expect(keys.length).equal(4);
      expect(keys).contain("partyActors");
      expect(keys).contain("config");
      expect(keys).contain("user");
      expect(keys).contain("settings");
    });
  });

  describe("_addActorToParty(actor)", () => {
    it("Monster returns undefined", async () => {
      const actor = await createMockActor("monster");
      const partySheet = new OsePartySheet();
      // eslint-disable-next-line no-underscore-dangle
      const promisedAnswer = await partySheet._addActorToParty(actor);
      expect(promisedAnswer).is.undefined;
      await actor.delete();
    });

    it("Adding a character updates the actor", async () => {
      const actor = await createMockActor("character");
      const partySheet = new OsePartySheet();
      // eslint-disable-next-line no-underscore-dangle
      const promisedAnswer = await partySheet._addActorToParty(actor);
      expect(promisedAnswer).is.undefined;
      assert(actor?.getFlag(game.system.id, "party"));
      await actor.delete();
    });
  });

  describe("_removeActorFromParty(actor)", async () => {
    it("Removing a character updates the actor flags", async () => {
      const actor = await createMockActor("character");
      const partySheet = new OsePartySheet();
      // eslint-disable-next-line no-underscore-dangle
      const promisedAddAnswer = await partySheet._addActorToParty(actor);
      expect(promisedAddAnswer).is.undefined;
      assert(actor?.getFlag(game.system.id, "party"));
      // eslint-disable-next-line no-underscore-dangle
      const promisedRemoveAnswer = await partySheet._removeActorFromParty(actor);
      expect(promisedRemoveAnswer).is.undefined;
      assert(!actor?.getFlag(game.system.id, "party"));
      await actor.delete();
    });
  });

  // @todo: Test with Cypress or mock event
  describe("_onDrop(event)", () => {});

  describe("_onDropActor(event, data)", () => {
    const event = "";
    it("Dropping a non-actor type returns nothing", async () => {
      const partySheet = new OsePartySheet();
      // eslint-disable-next-line no-underscore-dangle
      const resolvedResponse = await partySheet._onDropActor(event, {
        type: "not-actor",
      });
      expect(resolvedResponse).is.undefined;
    });

    it("Dropping an actor type updates the actor", async () => {
      const actor = await createMockActor("character");
      const data = {
        type: actor?.documentName,
        uuid: actor?.uuid,
      };
      const partySheet = new OsePartySheet();
      // eslint-disable-next-line no-underscore-dangle
      const promisedAnswer = await partySheet._onDropActor(event, data);
      await waitForInput();
      expect(promisedAnswer).is.undefined;
      assert(actor?.getFlag(game.system.id, "party"));
      await actor?.delete();
    });
  });

  describe("_recursiveAddFolder(folder)", () => {
    it("Folder of actors add actors to party", async () => {
      const partySheet = new OsePartySheet();
      const folder = await Folder.create({
        name: `Test Folder ${key}`,
        type: "Actor",
      });
      const actor = await createMockActor("character");
      // eslint-disable-next-line no-underscore-dangle
      await actor?.update({ folder: folder?._id });
      expect(actor?.folder).equal(folder);
      // eslint-disable-next-line no-underscore-dangle
      partySheet._recursiveAddFolder(folder);
      await waitForInput();
      assert(actor?.getFlag(game.system.id, "party"));
      await actor?.delete();
      await folder?.delete();
    });

    it("Folder with sub-folders of actors add actors to party", async () => {
      const partySheet = new OsePartySheet();
      const folder = await Folder.create({
        name: `Test Folder ${key}`,
        type: "Actor",
      });
      const subFolder = await Folder.create({
        name: `Test Folder ${key} subfolder`,
        type: "Actor",
        folder: folder._id,
      });
      const actor = await createMockActor("character");
      // eslint-disable-next-line no-underscore-dangle
      await actor?.update({ folder: subFolder?._id });
      expect(actor?.folder).equal(subFolder);
      // eslint-disable-next-line no-underscore-dangle
      partySheet._recursiveAddFolder(folder);
      await waitForInput();
      assert(actor?.getFlag(game.system.id, "party"));
      await actor?.delete();
    });
  });

  describe("_onDropFolder(event, data)", () => {
    it("Dropping with documentName that is not Actor returns undefined", async () => {
      const mockData = {
        documentName: "Not-Actor",
      };
      const partySheet = new OsePartySheet();
      const response = await partySheet._onDropFolder("", mockData);
      expect(response).is.undefined;
    });

    it("Dropping a folder with an actor in it adds it to the party", async () => {
      const partySheet = new OsePartySheet();
      const folder = await Folder.create({
        name: `Test Folder ${key}`,
        type: "Actor",
      });
      const actor = await createMockActor("character");
      // eslint-disable-next-line no-underscore-dangle
      await actor?.update({ folder: folder?._id });
      expect(actor?.folder).equal(folder);
      // eslint-disable-next-line no-underscore-dangle
      await partySheet._onDropFolder("", folder);
      await waitForInput();
      assert(actor?.getFlag(game.system.id, "party"));
      await actor?.delete();
      await folder?.delete();
    });
  });

  // @todo: Test with Cypress or Mock event
  describe("_onDragStart(event)", () => {});

  // Tested in OsePartyXP
  describe("_dealXP(event)", () => {});

  after(async () => {
    cleanUpActorsKey(key);
    game.folders?.contents
      ?.filter((a) => a.name?.includes(`Test Folder ${key}`))
      ?.forEach((a) => a.delete());
  });
};
