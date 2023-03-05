/**
 * @file Contains tests for Monster Sheet.
 */
// eslint-disable-next-line import/no-cycle
import { QuenchMethods } from "../../../e2e";
import {
  cleanUpActorsKey,
  closeDialogs,
  closeSheets,
  createActorTestItem,
  createMockActorKey,
  delay,
  getMockActorKey,
  openDialogs,
  waitForInput,
} from "../../../e2e/testUtils";
import OseActorSheetMonster from "../monster-sheet";

export const key = "ose.sheet.monster";
export const options = { displayName: "Sheet: Monster" };

export default ({ describe, it, expect, after, before }: QuenchMethods) => {
  const orginalCtrlSetting = game.settings.get(
    game.system.id,
    "invertedCtrlBehavior"
  );

  after(async () => {
    await game.settings.set(
      game.system.id,
      "invertedCtrlBehavior",
      orginalCtrlSetting
    );
    await cleanUpActorsKey(key);
    await closeSheets();
  });

  describe("defaultOptions()", () => {
    it("Has correctly set defaultOptions", async () => {
      const actor = await createMockActorKey("monster", {}, key);
      const sheet = actor?.sheet as unknown as OseActorSheetMonster;

      expect(sheet.options.classes).contain("ose");
      expect(sheet.options.classes).contain("sheet");
      expect(sheet.options.classes).contain("actor");
      expect(sheet.options.classes).contain("monster");

      expect(sheet.options.template).contain(
        "/templates/actors/monster-sheet.html"
      );
      expect(sheet.options.width).equal(450);
      expect(sheet.options.height).equal(560);
      expect(sheet.options.resizable).is.true;

      expect(sheet.options.tabs.length).equal(1);
      expect(Object.keys(sheet.options.tabs[0])).contain("navSelector");
      expect(sheet.options.tabs[0].navSelector).equal(".tabs");
      expect(Object.keys(sheet.options.tabs[0])).contain("contentSelector");
      expect(sheet.options.tabs[0].contentSelector).equal(".sheet-body");
      expect(Object.keys(sheet.options.tabs[0])).contain("initial");
      expect(sheet.options.tabs[0].initial).equal("attributes");
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });

  // @todo: Do we need separate tests for this, or is getData() enough?
  describe("_prepareItems(data)", () => {});

  describe("getData()", () => {
    it("returns the expected data", async () => {
      const actor = await createMockActorKey("monster", {}, key);
      const data = await actor?.sheet?.getData();

      // _prepareItems tests
      expect(Object.keys(data)).contain("owned");
      expect(Object.keys(data?.owned)).contain("weapons");
      expect(Object.keys(data?.owned)).contain("items");
      expect(Object.keys(data?.owned)).contain("containers");
      expect(Object.keys(data?.owned)).contain("armors");
      expect(Object.keys(data?.owned)).contain("treasures");
      expect(Object.keys(data)).contain("attackPatterns");
      expect(Object.keys(data)).contain("spells");
      expect(Object.keys(data)).contain("isNew");

      expect(data?.config.morale).equal(
        game.settings.get(game.system.id, "morale")
      );
      expect(Object.keys(data)).contain("system");
      expect(Object.keys(data?.system)).contain("details");
      expect(Object.keys(data?.system.details)).contain("treasure");
      expect(Object.keys(data?.system.details.treasure)).contain("link");
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });

  describe("generateSave()", () => {
    it("renders a dialog", async () => {
      const actor = await createMockActorKey("monster", {}, key);
      actor?.sheet?.generateSave();
      await waitForInput();

      const dialogs = openDialogs();
      expect(dialogs.length).equal(1);
      dialogs[0].close();
    });

    after(async () => {
      await cleanUpActorsKey(key);
      await closeDialogs();
      await delay(300);
    });
  });

  describe("_onDrop(event)", () => {
    const createMockRollTable = async () =>
      RollTable.create({ name: "Test RollTable" });

    after(async () => {
      await cleanUpActorsKey(key);
      game.tables
        ?.filter((rt) => rt.name === "Test RollTable")
        .forEach((rt) => rt.delete());
    });

    it("Can drag testing RollTable to Monster", async () => {
      const actor = await createMockActorKey("monster", {}, key);
      const rollTable = await createMockRollTable();
      actor?.sheet?.render(true);
      await delay(300);

      // Setup DOM elements
      const dragElement = document.querySelector(
        `.tab li[data-document-id=${rollTable?.id}]`
      );
      const dropElement = document.querySelector(`.monster .window-content`);

      // Check DOM elements
      expect(dragElement).not.null;
      expect(dropElement).not.null;

      // Perform Drag
      const mockDragStartEvent = new DragEvent("dragstart", {
        dataTransfer: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      });
      dragElement?.dispatchEvent(mockDragStartEvent);

      // Drop it
      // eslint-disable-next-line no-underscore-dangle
      actor?.sheet?._onDrop(mockDragStartEvent);
      await waitForInput();

      // Verify
      expect(actor?.system.details.treasure.table).equal(
        `@UUID[RollTable.${rollTable?.id}]`
      );
    });
  });

  describe("_resetAttacks(event)", () => {
    it("resets the counter to max", async () => {
      const actor = await createMockActorKey("monster", {}, key);
      actor?.sheet?.render(true);
      const [item] = await createActorTestItem(actor, "weapon");
      item.update({
        system: {
          counter: {
            max: 4,
            value: 1,
          },
        },
      });
      await delay(400);

      expect(item.system.counter.value).equal(1);

      // Click on reset
      $(`.item-reset`).trigger("click");
      await waitForInput();

      expect(item.system.counter.value).equal(4);
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });

  describe("_updateAttackCounter(event)", () => {
    before(() => {
      game.settings.set(game.system.id, "invertedCtrlBehavior", true);
    });

    it("updates counter when rolling", async () => {
      const actor = await createMockActorKey("monster", {}, key);
      actor?.sheet?.render(true);
      const [item] = await createActorTestItem(actor, "weapon");
      item.update({
        system: {
          counter: {
            max: 4,
            value: 4,
          },
        },
      });
      await delay(400);

      expect(item.system.counter.value).equal(4);

      // Click on reset
      $(`.tab .item[data-item-id="${item.id}"] .item-image`).trigger("click");
      await waitForInput();

      expect(item.system.counter.value).equal(3);
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });

  describe("_cycleAttackPatterns(event)", () => {
    const colors = Object.keys(CONFIG.OSE.colors);
    colors.push("transparent");

    before(async () => {
      const actor = await createMockActorKey("monster", {}, key);
      actor?.sheet?.render(true);
      await createActorTestItem(actor, "weapon");
      await delay(300);
    });

    describe("properly cycles between colors", () => {
      colors.forEach((color) => {
        it(`works for color ${color}`, async () => {
          const actor = await getMockActorKey(key);
          const item = actor?.items.contents[0];
          const currentPattern = item?.system.pattern;

          expect(currentPattern).not.undefined;
          const patternIndex = colors.indexOf(currentPattern);
          const nextIndex =
            patternIndex + 1 === colors.length ? 0 : patternIndex + 1;

          // Click the thing
          $(`.item-pattern`).trigger("click");
          await delay(200);

          // Verify
          expect(item?.system.pattern).equal(colors[nextIndex]);
        });
      });
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });
};
