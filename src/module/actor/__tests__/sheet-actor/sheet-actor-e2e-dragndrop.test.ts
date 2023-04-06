/**
 * @file Contains tests for dragging and dropping items to and from Actor Sheet.
 */
// eslint-disable-next-line prettier/prettier
import { QuenchMethods } from "../../../../e2e";
import {
  cleanUpActorsByKey,
  cleanUpWorldItems,
  createActorTestItem,
  createMockActorKey,
  createWorldTestItem,
  itemTypes,
  waitForInput, // eslint-disable-next-line prettier/prettier
} from "../../../../e2e/testUtils";
import OseItem from "../../../item/entity";
import OseActor from "../../entity";

export const key = "ose.actor.sheet.e2e.dragndrop";
export const options = {
  displayName: "OSE: Actor: Sheet E2E Drag'n'Drop",
  preSelected: true,
};

/* --------------------------------------------- */
/* Types for storing data between tests          */
/* --------------------------------------------- */
type DragNDropItem = {
  item: OseItem | undefined;
  itemElement: Element | null;
};

type DragNDropItems = {
  source: DragNDropItem;
  target: DragNDropItem;
};

type DragNDropDocuments = {
  actor: StoredDocument<Actor> | undefined;
  compendium: CompendiumCollection<any> | undefined;
};

/* --------------------------------------------- */
/* DOM Manipulation Helper functions             */
/* --------------------------------------------- */
const executeDrag = (sourceElement: Element | null) => {
  const mockDragStartEvent = new DragEvent("dragstart", {
    dataTransfer: new DataTransfer(),
    bubbles: true,
    cancelable: true,
  });
  sourceElement?.dispatchEvent(mockDragStartEvent);
  return mockDragStartEvent;
};

const executeDragNDrop = async (items: DragNDropItems) => {
  const mockDragStartEvent = new DragEvent("dragstart", {
    dataTransfer: new DataTransfer(),
    bubbles: true,
    cancelable: true,
  });
  items.source.itemElement?.dispatchEvent(mockDragStartEvent);

  const mockDropEvent = new DragEvent("drop", {
    dataTransfer: mockDragStartEvent.dataTransfer,
    bubbles: true,
    cancelable: true,
  });
  items.target.itemElement?.dispatchEvent(mockDropEvent);
};

export default ({
  describe,
  it,
  expect,
  after,
  afterEach,
  beforeEach,
}: QuenchMethods) => {
  describe("_onDragStart(event)", () => {
    it("populates dataTransfer correctly", async () => {
      const actor = (await createMockActorKey(
        "character",
        {},
        key
      )) as OseActor;
      expect(actor).not.undefined;

      await actor.sheet?.render(true);

      const [item] = await createActorTestItem(actor, "weapon");
      expect(item).not.undefined;
      await waitForInput();

      const itemElement = document.querySelector(
        `.sheet .inventory li.item[data-item-id="${item?.id}"]`
      );
      expect(itemElement).not.null;

      const event = executeDrag(itemElement);
      const parsedData = TextEditor.getDragEventData(event);
      expect(Object.keys(parsedData)).contain("item");
    });

    after(async () => {
      await cleanUpActorsByKey(key);
    });
  });

  // This is tested in the combined _onDragStart & _onDrop test
  describe("_onDropItem(event, data)", () => {});

  describe("_onDragStart(event, data) & _onDrop(event, data) - Containers", () => {
    // @todo: Move out to outer scope for re-use, potentially testUtils.
    /* --------------------------------------------- */
    /* Mock Helper functions                         */
    /* --------------------------------------------- */
    const createMockCompendium = async (
      type: CompendiumCollection.Metadata["type"]
      // eslint-disable-next-line unicorn/consistent-function-scoping
    ) =>
      // eslint-disable-next-line no-undef
      CompendiumCollection.createCompendium({
        label: "Test Compendium",
        name: "testcompendium",
        type,
        path: "",
        private: false,
        package: "world",
      });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const cleanUpCompendium = async () =>
      game.packs.get("world.testcompendium")?.deleteCompendium();

    /* --------------------------------------------- */
    /* Check Test Helper functions                   */
    /* --------------------------------------------- */
    const dragNDropSanityChecks = (
      documents: DragNDropDocuments,
      items: DragNDropItems
    ) => {
      // Check Actor constructed properly
      expect(documents.actor).not.undefined;
      expect(documents.actor?.documentName).equal("Actor");

      // Check Compendium constructed properly
      expect(documents.compendium).not.undefined;
      expect(documents.compendium?.documentName).equal("Item");

      // Check that the target constructed properly
      expect(items.target.item).not.undefined;
      expect(items.target.item?.documentName).equal("Item");
      expect(items.target.item?.name).equal("TargetContainer");

      // Check the target DOM is stored correctly
      expect(items.target.itemElement).not.null;
      expect(items.target.itemElement?.constructor.name).equal("HTMLLIElement");
    };

    const dragNDropCasePreflightCheck = (
      sourceItemName: string,
      items: DragNDropItems
    ) => {
      expect(items.source.item).not.undefined;
      expect(items.source.item?.documentName).equal("Item");
      expect(items.source.item?.name).equal(sourceItemName);

      expect(items.source.itemElement).not.null;
      expect(items.source.itemElement?.constructor.name).equal("HTMLLIElement");

      // Check source and target data
      expect(items.source.item?.system.containerId).equal("");
      expect(items.target.item?.system.itemIds.length).equal(0);
    };

    const dragNDropCasePostflightCheck = (
      documents: DragNDropDocuments,
      items: DragNDropItems
    ) => {
      // Check item data
      expect(items.target.item?.system.itemIds.length).equal(1);
      expect(items.target.item?.system.itemIds).contain(items.source.item?.id);
      expect(items.source.item?.system.containerId).equal(
        items.target.item?.id
      );

      // Check getters
      const getter =
        items.source.item?.type === "armor"
          ? items.source.item?.type
          : `${items.source.item?.type}s`;
      const amount = getter === "containers" ? 1 : 0;
      expect(documents.actor?.system[getter].length).equal(amount);
    };

    /* --------------------------------------------- */
    /* Specific cases                                */
    /* --------------------------------------------- */
    // Issue#357
    it("Issue#357 Dragging container onto itself should retain container in inventory", async () => {
      const items: DragNDropItems = {
        source: {} as DragNDropItem,
        target: {} as DragNDropItem,
      } as DragNDropItems;

      // Setup actor & items
      const actor = await createMockActorKey("character", {}, key);
      [items.target.item] = await createActorTestItem(
        actor,
        "container",
        "TargetContainer"
      );
      [items.source.item] = await createActorTestItem(actor, "weapon");

      // Render UI elements
      actor?.sheet?.render(true);
      await waitForInput();

      // Set the DOM elements
      items.source.itemElement = document.querySelector(
        `.sheet .inventory li.item[data-item-id="${items.source?.item?.id}"]`
      );
      items.target.itemElement = document.querySelector(
        `.sheet .inventory li.item[data-item-id="${items.target?.item?.id}"]`
      );

      // Execute drag'n'drop of stored item
      dragNDropCasePreflightCheck("New Actor Test Weapon", items);
      await executeDragNDrop(items);
      await waitForInput();

      // Check items
      expect(items.target.item?.system.itemIds.length).equal(1);
      expect(items.target.item?.system.itemIds).contain(items.source.item?.id);
      expect(items.source.item?.system.containerId).equal(
        items.target.item?.id
      );

      // Re-form the source item to use the target container
      items.source.itemElement = items.target.itemElement;
      items.source.item = items.target.item;

      // Execute drag'n'drop again
      await executeDragNDrop(items);
      await waitForInput();

      // Verify that the target container is still present
      const finalElement = document.querySelector(
        `.sheet .inventory li.item[data-item-id="${items.target?.item?.id}"]`
      );
      expect(finalElement).not.null;
    });

    /* --------------------------------------------- */
    /* Loop over item types                          */
    /* --------------------------------------------- */
    itemTypes.forEach((itemType) => {
      // Skip items that can't be put in a container
      if (itemType === "spell") return;
      if (itemType === "ability") return;

      // Initiate storage of actor, items, and DOM elements
      const documents: DragNDropDocuments = {} as DragNDropDocuments;
      const items: DragNDropItems = {
        source: {} as DragNDropItem,
        target: {} as DragNDropItem,
      } as DragNDropItems;

      describe(`manipulating ${itemType} item type`, () => {
        beforeEach(async () => {
          // Set up actor & compendium
          documents.actor = await createMockActorKey("character", {}, key);
          documents.compendium = await createMockCompendium("Item");

          // Create target container
          [items.target.item] = await createActorTestItem(
            documents.actor,
            "container",
            "TargetContainer"
          );

          // Render UI elements
          documents.actor?.sheet?.render(true);
          documents.compendium?.render(true);
          await waitForInput();

          // Record Target DOM
          items.target.itemElement = document.querySelector(
            `.sheet .inventory li.item[data-item-id="${items.target.item?.id}"]`
          );
        });

        it(`drag ${itemType} from actor sheet into a container in a character sheet`, async () => {
          dragNDropSanityChecks(documents, items);

          // Create item in actor sheet
          [items.source.item] = await createActorTestItem(
            documents.actor,
            itemType
          );

          // Wait for UI to keep up
          await waitForInput();

          // Create DOM element
          items.source.itemElement = document.querySelector(
            `.sheet .inventory li.item[data-item-id="${items.source.item?.id}"]`
          );

          // Perform pre-flight checks
          const sourceItemName = `New Actor Test ${itemType.capitalize()}`;
          dragNDropCasePreflightCheck(sourceItemName, items);

          // Drag N Drop
          await executeDragNDrop(items);
          await waitForInput();

          // Perform post-flight checks
          dragNDropCasePostflightCheck(documents, items);
        });

        it(`drag ${itemType} from item sidebar into a container in a character sheet`, async () => {
          dragNDropSanityChecks(documents, items);

          // Create item in sidebar
          items.source.item = (await createWorldTestItem(itemType)) as OseItem;

          // Wait for UI to keep up
          await waitForInput();

          // Create DOM element
          items.source.itemElement = document.querySelector(
            `.sidebar-tab[data-tab="items"] li.item[data-document-id="${items.source.item?.id}"]`
          );

          // Perform pre-flight checks
          const sourceItemName = `New World Test ${itemType.capitalize()}`;
          dragNDropCasePreflightCheck(sourceItemName, items);

          // Drag N Drop
          await executeDragNDrop(items);
          await waitForInput();

          // Store new item as it recreates in the character sheet
          items.source.item = documents.actor?.items.getName(
            items.source.item?.name
          ) as OseItem;

          // Perform post-flight checks
          dragNDropCasePostflightCheck(documents, items);
        });

        it(`drag ${itemType} from compendium into a container in a character sheet`, async () => {
          dragNDropSanityChecks(documents, items);

          // Create item in compendium
          const worldItem = (await createWorldTestItem(itemType)) as OseItem;
          items.source.item = await documents.compendium?.importDocument(
            worldItem
          );

          // Wait for UI to keep up
          await waitForInput();

          // Create DOM element
          items.source.itemElement = document.querySelector(
            `.compendium li.item[data-document-id="${items.source.item?.id}"]`
          );

          // Perform pre-flight checks
          const sourceItemName = `New World Test ${itemType.capitalize()}`;
          dragNDropCasePreflightCheck(sourceItemName, items);

          // Drag N Drop
          await executeDragNDrop(items);
          await waitForInput();

          // Store new item as it recreates in the character sheet
          items.source.item = documents.actor?.items.getName(
            items.source.item?.name
          ) as OseItem;

          // Perform post-flight checks
          dragNDropCasePostflightCheck(documents, items);
        });

        afterEach(async () => {
          await cleanUpActorsByKey(key);
          await cleanUpCompendium();
          await cleanUpWorldItems();
        });
      });
    });
  });
};
