/**
 * @file Contains Quench tests for testing macro creation from character.
 */
import { trashChat, waitForInput } from "../../../e2e/testUtils";
import { createOseMacro } from "../../macros";

export const key = "ose.macro.create.actor.item";
export const options = {
  displayName: "Macro: Create Character Item Macros",
};

const trashMacro = async () => {
  await game.macros.find((o) => o.name === "Test Macro Item")?.delete();
  await game.user.assignHotbarMacro(null, 1);
};

const createItemMacroData = (item) => {
  const dragData = item.toDragData();
  dragData.item = item;
  dragData.type = "Item";
  return dragData;
};

export default ({ before, after, afterEach, describe, it, expect }) => {
  const testCharacterName = "Quench Test Character";

  const testActor = () => game.actors.getName(testCharacterName);
  const trashActor = () => testActor()?.delete();

  const prepareActor = async (data) => {
    await trashChat();
    await trashActor();

    return Actor.create({
      ...data,
      name: testCharacterName,
      type: "character",
    });
  };

  const createItem = async (type) => {
    await testActor()?.createEmbeddedDocuments("Item", [
      { type, name: "Test Macro Item" },
    ]);
  };

  const canCreate = async (type) => {
    await createItem(type);
    const item = testActor().items.contents[0];
    const data = createItemMacroData(item);
    await createOseMacro(data, 1);
    await waitForInput();

    const createdMacro = game.user.getHotbarMacros()[0];
    expect(
      createdMacro?.macro?.command.indexOf("game.ose.rollItemMacro")
    ).not.equal(-1);
  };

  before(async () => {
    await trashChat();
  });

  describe("Item Macro", () => {
    before(async () => {
      await prepareActor();
      trashMacro();
    });

    after(async () => {
      await trashChat();
      await trashActor();
    });

    afterEach(() => {
      trashMacro();
    });

    it("Create weapon macro", async () => {
      await canCreate("weapon");
    });
    it("Create spell macro", async () => {
      await canCreate("spell");
    });
  });
};
