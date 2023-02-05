/**
 * @file Cotains Quench for containers in actor sheets
 */
import {
  cleanUpWorldItems,
  createWorldTestItem,
  trashChat,
  waitForInput,
} from "../../../e2e/testUtils";

export const key = "ose.actor.crud.inventory.container";
export const options = {
  displayName: "Actor CRUD: Inventory, Container",
};

const createTestCompendium = async () =>
  // eslint-disable-next-line no-undef
  CompendiumCollection.createCompendium({
    id: "world.compendiumtest",
    label: "Compendium Test",
    name: "compendiumtest",
    type: "Item",
  });

const deleteTestCompendium = async () => {
  game.packs.get("world.compendiumtest")?.deleteCompendium();
};

export default ({
  before,
  beforeEach,
  after,
  afterEach,
  expect,
  describe,
  it,
}) => {
  const testCharacterName = "Quench Test Character";

  const testActor = () => game.actors.getName(testCharacterName);
  const testActorSheet = () => testActor()?.sheet;
  const trashActor = () => testActor()?.delete();
  const trashItems = () => {
    testActor()?.items?.forEach((o) => o.delete());
    game.items
      .filter((o) => o.name.includes("New World Test"))
      .forEach((o) => o.delete());
  };

  const prepareActor = async (data) => {
    await trashChat();
    await trashActor();

    return Actor.create({
      ...data,
      name: testCharacterName,
      type: "character",
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderInventory = async () => {
    // eslint-disable-next-line no-underscore-dangle
    await testActor().sheet._render(true);
  };

  /* --------------------------------------- */

  const createActorTestItem = async (type) =>
    testActor().createEmbeddedDocuments(
      "Item",
      [{ type, name: `New Actor Test ${type.capitalize()}` }],
      {}
    );

  /* --------------------------------------- */

  const testAddContainerToActor = async () => {
    expect(testActor().items.size).equals(0);
    const testItem = await createActorTestItem("container");
    expect(testActor().items.size).equals(1);
    expect(testItem.length).equals(1);
    expect(testItem[0].name).equals("New Actor Test Container");
    expect(testActor().system.containers.length).equal(1);
  };

  const testAddContainerAndItem = async () => {
    await testAddContainerToActor();
    await createActorTestItem("item");
    expect(testActor().items.size).equals(2);
    expect(testActor().system.items.length).equal(1);
  };

  const testAddWorldItem = async () => {
    expect(game.items.getName("New World Test Item")).is.undefined;
    await createWorldTestItem("item");
    const testItem = game.items.getName("New World Test Item");
    expect(testItem).is.not.undefined;
    return testItem;
  };

  /* --------------------------------------- */

  const testMoveItemToContainer = async (sourceItem, targetItem) => {
    // eslint-disable-next-line no-underscore-dangle
    await testActorSheet()._onContainerItemAdd(sourceItem, targetItem);

    // eslint-disable-next-line no-underscore-dangle
    expect(sourceItem.system.containerId).equals(targetItem._id);
    expect(targetItem.system.itemIds.length).equals(1);
    // eslint-disable-next-line no-underscore-dangle
    expect(targetItem.system.itemIds[0]).equals(sourceItem._id);
    expect(testActor().system.containers.length).equal(1);
    expect(testActor().system.items.length).equal(0);
  };

  /* --------------------------------------- */

  const testSetupContainerAndItem = async () => {
    await testAddContainerAndItem();
    const sourceItem = testActor().items.getName("New Actor Test Item");
    const targetItem = testActor().items.getName("New Actor Test Container");
    await testMoveItemToContainer(sourceItem, targetItem);
    expect(testActor().items.size).equals(2);
    expect(testActor().system.containers.length).equal(1);
    expect(testActor().system.items.length).equal(0);
  };

  /* --------------------------------------- */

  before(async () => {
    await trashChat();
    await prepareActor();
  });

  after(async () => {
    await trashChat();
    await trashActor();
    await cleanUpWorldItems();
  });

  afterEach(async () => {
    trashItems();
    await deleteTestCompendium();
    await waitForInput();
  });

  /* --------------------------------------- */

  describe("Creating", () => {
    it("Creating a container item on the Actor", async () => {
      await testAddContainerToActor();
    });
    it("Adding item from the actor itself into Actor container", async () => {
      await testSetupContainerAndItem();
    });
    it("Adding item from Items sidebar into Actor container", async () => {
      const testItem = await testAddWorldItem();

      await testAddContainerToActor();

      const testContainer = testActor().items.getName(
        "New Actor Test Container"
      );
      // eslint-disable-next-line no-underscore-dangle
      await testActorSheet()._onContainerItemAdd(testItem, testContainer);

      const testItemActor = testActor().items.getName("New World Test Item");
      // eslint-disable-next-line no-underscore-dangle
      expect(testItemActor.system.containerId).equals(testContainer._id);
      expect(testContainer.system.itemIds.length).equals(1);
      // eslint-disable-next-line no-underscore-dangle
      expect(testContainer.system.itemIds[0]).equals(testItemActor._id);
      expect(testActor().system.containers.length).equal(1);
      expect(testActor().system.items.length).equal(0);
    });
    it("Adding item from Item Compendium into Actor container", async () => {
      expect(game.packs.get("world.testcompendiumtest")).undefined;
      await createTestCompendium();
      expect(game.packs.get("world.compendiumtest")).not.undefined;
      expect(game.packs.get("world.compendiumtest").size).equal(0);

      const testWorldItem = await testAddWorldItem();

      await game.packs
        .get("world.compendiumtest")
        .importDocument(testWorldItem);
      expect(game.packs.get("world.compendiumtest").size).equal(1);

      const testItem = game.packs.get("world.compendiumtest").contents[0];
      expect(testItem).not.undefined;

      await testAddContainerToActor();
      const testContainer = testActor().items.getName(
        "New Actor Test Container"
      );
      // eslint-disable-next-line no-underscore-dangle
      await testActorSheet()._onContainerItemAdd(testItem, testContainer);

      const testItemActor = testActor().items.getName("New World Test Item");
      // eslint-disable-next-line no-underscore-dangle
      expect(testItemActor.system.containerId).equals(testContainer._id);
      expect(testContainer.system.itemIds.length).equals(1);
      // eslint-disable-next-line no-underscore-dangle
      expect(testContainer.system.itemIds[0]).equals(testItemActor._id);
      expect(testActor().system.containers.length).equal(1);
      expect(testActor().system.items.length).equal(0);
    });
  });

  describe("Removing", () => {
    beforeEach(async () => {
      await testSetupContainerAndItem();
    });

    // it('Trying to remove container with items asks for confirmation', () => {})
    // it('Confirmed deletion pops contained items into inventory', () => {})
    // it('Cancelled confirmation cancels leaves container & inventory as-is', () => {})
    it("Removing contained item updates containers internal id list", async () => {
      const testItem = testActor().items.getName("New Actor Test Item");
      const testContainer = testActor().items.getName(
        "New Actor Test Container"
      );
      expect(testItem).not.undefined;
      expect(testContainer).not.undefined;

      // eslint-disable-next-line no-underscore-dangle
      await testActorSheet()._removeItemFromActor(testItem);
      await waitForInput();
      expect(testActor().system.containers.length).equal(1);
      expect(testContainer.system.itemIds.length).equal(0);
      expect(testActor().system.items.length).equal(0);
    });
    it("Dragging contained item into inventory again removes it from container", async () => {
      const testItem = testActor().items.getName("New Actor Test Item");
      const testContainer = testActor().items.getName(
        "New Actor Test Container"
      );
      expect(testItem).not.undefined;
      expect(testContainer).not.undefined;

      // eslint-disable-next-line no-underscore-dangle
      await testActorSheet()._onContainerItemRemove(testItem, testContainer);
      await waitForInput();
      expect(testActor().system.containers.length).equal(1);
      expect(testContainer.system.itemIds.length).equal(0);
      expect(testActor().system.items.length).equal(1);
      expect(testItem.system.containerId).equal("");
    });
  });
  // describe('Updating', () => {
  //     it('Updating the container description shows up in actor sheet', () => {})
  // })
  // describe('Displaying', () => {
  //     it('Clicking on an item in inventory expands to show summary', () => {})
  //     it('Clicking the container icon displays container & its contents to chat', () => {})
  // })
};
