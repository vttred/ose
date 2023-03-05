/**
 * @file Contains tests for Actor Sheet.
 */
// eslint-disable-next-line import/no-cycle
import { QuenchMethods } from "../../../e2e";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  cleanUpActorsKey,
  cleanUpMacros,
  closeDialogs,
  closeSheets,
  createActorTestItem,
  createMockActorKey,
  createMockMacro,
  createWorldTestItem,
  delay,
  itemTypes,
  openDialogs,
  openWindows,
  trashChat,
  waitForInput,
} from "../../../e2e/testUtils";
import OseItem from "../../item/entity";
import OseActorSheet from "../actor-sheet";
import OseActor from "../entity";

export const key = "ose.sheet.actor";
export const options = {
  displayName: "Sheet: Actor (long)",
  preSelected: false,
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
/* Helper Functions                              */
/* --------------------------------------------- */
const getActor = async () => game.actors?.getName(`Test Actor ${key}`);

export default ({
  describe,
  it,
  expect,
  after,
  afterEach,
  before,
  beforeEach,
}: QuenchMethods) => {
  // Saving settings being modified by tests
  const originalCtrlSetting = game.settings.get(
    game.system.id,
    "invertedCtrlBehavior"
  );

  after(async () => {
    await cleanUpActorsKey(key);
    await closeSheets();
    game.settings.set(
      game.system.id,
      "invertedCtrlBehavior",
      originalCtrlSetting
    );
  });

  describe("getData()", () => {
    it("returns the expected data", async () => {
      const actor = (await createMockActorKey(
        "character",
        {},
        key
      )) as OseActor;
      const sheet = new OseActorSheet(actor);
      const data = sheet.getData();

      expect(data.owner).equal(actor?.isOwner);
      expect(data.editable).equal(actor?.sheet?.isEditable);
      expect(Object.keys(data.config)).contain("ascendingAC");
      expect(Object.keys(data.config)).contain("initiative");
      expect(Object.keys(data.config)).contain("encumbrance");
      expect(data.isNew).equal(actor?.isNew());
    });
  });

  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_getItemFromActor(event)", () => {
    itemTypes.forEach((itemType) => {
      it(`Can get an ${itemType.capitalize()} item`, async () => {
        // Create item
        const actor = await createMockActorKey("character", {}, key);
        await actor?.update({ system: { spells: { enabled: true } } });
        actor?.sheet?.render(true);
        await delay(200);

        const item = await createActorTestItem(actor, itemType);
        await waitForInput();

        expect(actor?.items.size).equal(1);
        const mockedItem = item?.pop();
        expect(actor?.items.contents.find((o) => o.id === mockedItem?.id)).not
          .undefined;

        // Select tab to look inside
        let tab = "";
        switch (itemType) {
          // eslint-disable-next-line switch-case/no-case-curly
          case "spell": {
            tab = ".tab[data-tab=spells]";
            break;
          }

          // eslint-disable-next-line switch-case/no-case-curly
          case "ability": {
            tab = ".tab[data-tab=abilities]";
            break;
          }

          // eslint-disable-next-line switch-case/no-case-curly
          default: {
            tab = ".tab[data-tab=inventory]";
          }
        }

        // Setup what to click
        const clickElement = document.querySelector(`${tab} .item-name`);
        const descriptionStyle =
          clickElement?.parentElement?.nextElementSibling?.style;
        expect(descriptionStyle.display).equal("");

        // Mock event
        $(`${tab} .item-name`).trigger("click");
        await delay(200);

        // Verify method
        expect(descriptionStyle.display).equal("block");

        // Cleanup
        await actor?.delete();
      });

      after(async () => {
        await cleanUpActorsKey(key);
        await closeSheets();
      });
    });
  });

  // @todo: Introduce Extended from dnd5e/PF2e
  describe("_toggleItemCategory(event)", () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const clickCategory = async () => {
      $(".tab[data-tab=inventory] .item-category-title").trigger("click");
      await delay(220);
    };

    before(async () => {
      const actor = (await createMockActorKey(
        "character",
        {},
        key
      )) as OseActor;
      await actor.update({ system: { spells: { enabled: true } } });
      actor?.sheet?.render(true);
      await delay(220);
    });

    it("clicking the category name hides the item cateogry", async () => {
      const sheets = openWindows("sheet");
      expect(sheets.length).equal(1);
      const categoryElement = document.querySelector(
        ".tab[data-tab=inventory] .item-list"
      );
      expect(categoryElement?.style.display).equal("");
      await clickCategory();
      expect(categoryElement?.style.display).equal("none");
    });

    it("clicking the category name again shows the item cateogry", async () => {
      const sheets = openWindows("sheet");
      expect(sheets.length).equal(1);
      const categoryElement = document.querySelector(
        ".tab[data-tab=inventory] .item-list"
      );
      expect(categoryElement?.style.display).equal("none");
      await clickCategory();
      expect(categoryElement?.style.display).equal("");
    });

    after(async () => {
      await cleanUpActorsKey(key);
      await closeSheets();
    });
  });

  describe("_toggleContainedItems(event)", () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const clickContainerCaret = async () => {
      $(".tab[data-tab=inventory] .container .category-caret").trigger("click");
      await delay(220);
    };

    before(async () => {
      const actor = await createMockActorKey("character", {}, key);
      await createActorTestItem(actor, "container");
      await createActorTestItem(actor, "weapon");
      const weapon = actor?.items.getName("New Actor Test Weapon");
      const container = actor?.items.getName("New Actor Test Container");
      // eslint-disable-next-line no-underscore-dangle
      await weapon?.update({ system: { containerId: container?.id } });
      actor?.sheet?.render(true);
    });

    it("clicking container caret will hide the content", async () => {
      const sheets = openWindows("sheet");
      expect(sheets.length).equal(1);

      const actor = await getActor();
      expect(actor?.items.size).equal(2);

      const container = actor?.items?.getName("New Actor Test Container");
      expect(
        actor?.items.getName("New Actor Test Weapon")?.system.containerId
      ).equal(container?.id);
      const containerElement = document.querySelector(
        ".tab[data-tab=inventory] .container .contained-items"
      );
      expect(containerElement?.style.display).equal("");

      await clickContainerCaret();
      expect(containerElement?.style.display).equal("none");
    });

    it("clicking container caret again will show the content", async () => {
      const sheets = openWindows("sheet");
      expect(sheets.length).equal(1);

      const actor = await getActor();
      expect(actor?.items.size).equal(2);

      const container = actor?.items?.getName("New Actor Test Container");
      expect(
        actor?.items.getName("New Actor Test Weapon")?.system.containerId
      ).equal(container?.id);
      const containerElement = document.querySelector(
        ".tab[data-tab=inventory] .container .contained-items"
      );

      expect(containerElement?.style.display).equal("none");
      await clickContainerCaret();
      expect(containerElement?.style.display).equal("");
    });

    after(async () => {
      await cleanUpActorsKey(key);
      await closeSheets();
    });
  });

  describe("_toggleItemSummary(event)", () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const clickItemSummary = async (tab: string) => {
      $(`${tab} .item-name`).trigger("click");
      await delay(220);
    };

    before(async () => {
      const actor = await createMockActorKey("character", {}, key);
      await actor?.update({ system: { spells: { enabled: true } } });
      actor?.sheet?.render(true);
      await delay(220);
    });

    itemTypes.forEach(async (itemType) => {
      let tab = "";
      switch (itemType) {
        // eslint-disable-next-line switch-case/no-case-curly
        case "spell": {
          tab = ".tab[data-tab=spells]";
          break;
        }

        // eslint-disable-next-line switch-case/no-case-curly
        case "ability": {
          tab = ".tab[data-tab=abilities]";
          break;
        }

        // eslint-disable-next-line switch-case/no-case-curly
        default: {
          tab = ".tab[data-tab=inventory]";
        }
      }

      describe(`for type ${itemType}`, () => {
        before(async () => {
          const actor = await getActor();
          await createActorTestItem(actor, itemType);
        });

        it("clicking item name will show the content", async () => {
          const sheets = openWindows("sheet");
          expect(sheets.length).equal(1);

          const actor = await getActor();
          expect(actor?.items.size).equal(1);

          const summaryElement = document.querySelector(`${tab} .item-summary`);
          expect(summaryElement?.style.display).equal("");

          await clickItemSummary(tab);
          expect(summaryElement?.style.display).equal("block");
        });
        it("clicking item name again will hide the content", async () => {
          const sheets = openWindows("sheet");
          expect(sheets.length).equal(1);

          const actor = await getActor();
          expect(actor?.items.size).equal(1);

          const summaryElement = document.querySelector(`${tab} .item-summary`);
          expect(summaryElement?.style.display).equal("block");
          await clickItemSummary(tab);
          expect(summaryElement?.style.display).equal("");
        });
        it("item containing description still shows the summary", async () => {
          // @todo: This fails, as updated item re-renders the sheet,
          //        and it collapses the summary
          const actor = await getActor();
          const item = actor?.items.getName(
            `New Actor Test ${itemType.capitalize()}`
          );

          await clickItemSummary(tab);
          await item?.update({ system: { description: "hello world" } });
          await waitForInput();
          expect(item?.system.description).equal("hello world");

          const summaryElement = document.querySelector(`${tab} .item-summary`);
          expect(summaryElement?.innerHTML.indexOf("hello world") >= 0).is.true;

          await item?.update({ system: { description: "" } });
        });
        it("item containing macro reference still shows the summary, Issue #353", async () => {
          const macro = await createMockMacro();
          const macroReference = `<p>@UUID[${macro?.uuid}]{Mock Macro}</p>`;

          const actor = await getActor();
          const item = actor?.items.getName(
            `New Actor Test ${itemType.capitalize()}`
          );
          await item?.update({ system: { description: macroReference } });
          await waitForInput();

          const summaryElement = document.querySelector(`${tab} .item-summary`);
          expect(summaryElement?.innerHTML).equal("");
          expect(summaryElement?.innerHTML.indexOf(macroReference) >= 0).true;
          await macro?.delete();
          await item?.update({ system: { description: "" } });
        });

        after(async () => {
          const actor = await getActor();
          actor?.items.forEach(async (i) => {
            await i.delete();
          });
          await cleanUpMacros();
        });
      });
    });

    after(async () => {
      await cleanUpActorsKey(key);
      await closeSheets();
    });
  });

  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_displayItemInChat(event)", () => {
    const clickItemShow = async (tab: string) => {
      $(`${tab} .item-show`).trigger("click");
      await delay(220);
    };

    before(async () => {
      const actor = await createMockActorKey("character", {}, key);
      await actor?.update({ system: { spells: { enabled: true } } });
      actor?.sheet?.render(true);
      await delay(220);
    });

    itemTypes.forEach((itemType) => {
      let tab = "";
      switch (itemType) {
        // eslint-disable-next-line switch-case/no-case-curly
        case "spell": {
          tab = ".tab[data-tab=spells]";
          break;
        }

        // eslint-disable-next-line switch-case/no-case-curly
        case "ability": {
          tab = ".tab[data-tab=abilities]";
          break;
        }

        // eslint-disable-next-line switch-case/no-case-curly
        default: {
          tab = ".tab[data-tab=inventory]";
        }
      }

      it(`can show ${itemType}`, async () => {
        await trashChat();
        const actor = await getActor();
        await createActorTestItem(actor, itemType);
        await waitForInput();
        await clickItemShow(tab);
        await waitForInput();
        expect(game.messages?.size).equal(1);
        expect(game.messages?.contents[0]?.content).contain(
          `New Actor Test ${itemType.capitalize()}`
        );
        actor?.items.forEach((i) => i.delete());
      });

      after(async () => {
        await cleanUpActorsKey(key);
      });
    });
  });

  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_removeItemFromActor(item)", () => {
    before(async () => {
      const actor = await createMockActorKey("character", {}, key);
      await actor?.update({ system: { spells: { enabled: true } } });
      actor?.sheet?.render(true);
    });

    itemTypes.forEach((itemType) => {
      describe(`${itemType} item`, () => {
        it("can remove item outside container", async () => {
          const actor = (await getActor()) as OseActor;
          expect(actor?.items.size).equal(0);

          await createActorTestItem(actor, itemType);
          await waitForInput();
          const item = actor?.items.getName(
            `New Actor Test ${itemType.capitalize()}`
          );
          expect(actor?.items.size).equal(1);

          // eslint-disable-next-line no-underscore-dangle
          await actor?.sheet?._removeItemFromActor(item);
          await waitForInput();
          expect(actor?.items.size).equal(0);
        });

        if (
          itemType !== "container" &&
          itemType !== "spell" &&
          itemType !== "ability"
        ) {
          it("can remove item inside container", async () => {
            const actor = await getActor();
            expect(actor?.items.size).equal(0);

            await createActorTestItem(actor, "container");
            await createActorTestItem(actor, itemType);
            await waitForInput();
            expect(actor?.items.size).equal(2);

            const item = actor?.items.getName(
              `New Actor Test ${itemType.capitalize()}`
            );
            const container = actor?.items.getName(`New Actor Test Container`);
            expect(item).not.undefined;
            expect(container).not.undefined;

            // eslint-disable-next-line no-underscore-dangle
            await actor?.sheet?._onContainerItemAdd(item, container);
            await waitForInput();

            // eslint-disable-next-line no-underscore-dangle
            await actor?.sheet?._removeItemFromActor(item);
            await waitForInput();
            expect(actor?.items.size).equal(1);
            expect(container?.system.itemIds.length).equal(0);

            // eslint-disable-next-line no-underscore-dangle
            await actor?.sheet?._removeItemFromActor(container);
            await waitForInput();
            expect(actor?.items.size).equal(0);
          });
          it("removing container with item inside deletes just container", async () => {
            const actor = await getActor();
            expect(actor?.items.size).equal(0);

            await createActorTestItem(actor, "container");
            await createActorTestItem(actor, itemType);
            await waitForInput();
            expect(actor?.items.size).equal(2);

            const item = actor?.items.getName(
              `New Actor Test ${itemType.capitalize()}`
            );
            const container = actor?.items.getName(`New Actor Test Container`);
            expect(item).not.undefined;
            expect(container).not.undefined;
            expect(actor?.items.size).equal(2);

            // eslint-disable-next-line no-underscore-dangle
            await actor?.sheet?._removeItemFromActor(container);
            await waitForInput();
            expect(actor?.items.size).equal(1);
            // eslint-disable-next-line no-underscore-dangle
            await actor?.sheet?._removeItemFromActor(item);
            await waitForInput();
            expect(actor?.items.size).equal(0);
          });
        }
      });

      after(async () => {
        await cleanUpActorsKey(key);
      });
    });
  });
  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_useConsumable(event, decrement)", () => {
    const clickConsumableEmpty = async () =>
      $(`.tab[data-tab=inventory] .empty-mark`).trigger("click");

    const clickConsumableFull = async () =>
      $(`.tab[data-tab=inventory] .full-mark`).trigger("click");

    before(async () => {
      const actor = await createMockActorKey("character", {}, key);
      await createActorTestItem(actor, "item");
      await waitForInput();

      const item = actor?.items.contents[0];
      item?.update({ system: { quantity: { max: 6, value: 3 } } });
      await waitForInput();

      actor?.sheet?.render(true);
      await delay(220);
    });

    // full = true, empty = false
    it("can decrease value", async () => {
      const actor = await getActor();
      const item = actor?.items.contents[0];
      expect(item?.system.quantity.value).equal(3);
      await clickConsumableFull();
      await waitForInput();
      expect(item?.system.quantity.value).equal(2);
    });
    it("can increase value", async () => {
      const actor = await getActor();
      const item = actor?.items.contents[0];
      expect(item?.system.quantity.value).equal(2);
      await clickConsumableEmpty();
      await waitForInput();
      expect(item?.system.quantity.value).equal(3);
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });

  describe("_onSpellChange(event)", () => {
    before(async () => {
      const actor = await createMockActorKey("character", {}, key);
      await actor?.update({ system: { spells: { enabled: true } } });
      await createActorTestItem(actor, "spell");
      await waitForInput();
      actor?.sheet?.render(true);
    });

    // @todo: How to properly mock updating a field here?
    it("changing the input for cast changes spell cast data", async () => {
      $("input[data-field=cast]").val(3);
      await waitForInput();

      const actor = await getActor();
      const item = actor?.items.contents[0];
      expect(item?.system.cast).equal(3);
    });

    // @todo: How to properly mock updating a field here?
    it("changing the input for memorize changes spell memorize data", async () => {
      $("input[data-field=cast]").val(3);
      await waitForInput();

      const actor = await getActor();
      const item = actor?.items.contents[0];
      expect(item?.system.memorized).equal(3);
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });

  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_resetSpells(event)", () => {
    before(async () => {
      const actor = await createMockActorKey("character", {}, key);
      await actor?.update({ system: { spells: { enabled: true } } });
      await createActorTestItem(actor, "spell");
      await waitForInput();
      actor?.items.contents[0].update({ system: { cast: 1, memorized: 3 } });
      actor?.sheet?.render(true);
    });

    it("resetting spells resets the cast field to maximum", async () => {
      const actor = await getActor();

      $("a[data-action=reset-spells]").trigger("click");
      await waitForInput();

      expect(actor?.items.contents[0].system.cast).equal(
        actor?.items.contents[0].system.memorized
      );
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });

  // @todo: Refactor to entity and just use event parsing in sheet
  // @todo: Localization when checking content of chat cards.
  describe("_rollAbility(event) ", () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const mockClickItem = async (tab: string) => {
      $(`.tab[data-tab=${tab}] .item-image`).trigger("click");
      await delay(220);
    };

    before(async () => {
      game.settings.set(game.system.id, "invertedCtrlBehavior", true);
      await trashChat();
    });

    afterEach(async () => {
      await cleanUpActorsKey(key);
      await trashChat();
    });

    it("rolling weapon on monster updates the counter value", async () => {
      // Sanity checks
      expect(game.messages?.size).equal(0);

      // Setup
      const actor = await createMockActorKey("monster", {}, key);
      await createActorTestItem(actor, "weapon");
      await waitForInput();
      await actor?.items.contents[0].update({
        system: { counter: { value: 3, max: 3 } },
      });
      expect(actor?.items.size).equal(1);
      actor?.sheet?.render(true);
      await waitForInput();
      await mockClickItem("attributes");

      // Verification
      expect(game.messages?.size).equal(1);
      expect(game.messages?.contents[0].content).contain(
        "<h2>Attacks with New Actor Test Weapon</h2>"
      );
      expect(actor?.items.contents[0].system.counter.value).equal(2);
    });

    it("rolling weapon on character rolls weapon", async () => {
      // Sanity checks
      expect(game.messages?.size).equal(0);

      // Setup
      const actor = await createMockActorKey("character", {}, key);
      await createActorTestItem(actor, "weapon");
      await waitForInput();
      expect(actor?.items.size).equal(1);
      actor?.sheet?.render(true);
      await waitForInput();
      await mockClickItem("inventory");

      // Verification
      // @todo: i18n
      expect(game.messages?.size).equal(1);
      expect(game.messages?.contents[0].content).contain(
        "<h2>Attacks with New Actor Test Weapon</h2>"
      );
    });

    it("rolling spell rolls and spends the spell", async () => {
      // Sanity checks
      expect(game.messages?.size).equal(0);

      // Setup
      const actor = await createMockActorKey("character", {}, key);
      await actor?.update({ system: { spells: { enabled: true } } });
      await createActorTestItem(actor, "spell");
      await waitForInput();
      expect(actor?.items.size).equal(1);
      actor?.sheet?.render(true);
      await waitForInput();
      await mockClickItem("spells");

      // Verification
      expect(game.messages?.size).equal(1);
      expect(game.messages?.contents[0].content).contain(
        "<h2>New Actor Test Spell</h2>"
      );
    });

    it("rolling anything else rolls the formula", async () => {
      // Sanity checks
      expect(game.messages?.size).equal(0);

      // Setup
      const actor = await createMockActorKey("character", {}, key);
      await actor?.update({ system: { spells: { enabled: true } } });
      await createActorTestItem(actor, "ability");
      await waitForInput();
      expect(actor?.items.size).equal(1);
      await actor?.items.contents[0].update({ system: { roll: "1d6" } });
      await waitForInput();
      expect(actor?.items.contents[0].system.roll).equal("1d6");
      actor?.sheet?.render(true);
      await waitForInput();
      await mockClickItem("abilities");

      // Verification
      expect(game.messages?.size).equal(1);
      expect(game.messages?.contents[0].content).contain(
        "<h2>New Actor Test Ability roll</h2>"
      );
    });

    it("rolling anything else, without a formula, does nothing", async () => {
      // Sanity checks
      expect(game.messages?.size).equal(0);

      // Setup
      const actor = await createMockActorKey("character", {}, key);
      await actor?.update({ system: { spells: { enabled: true } } });
      await createActorTestItem(actor, "spell");
      await waitForInput();
      expect(actor?.items.size).equal(1);
      actor?.sheet?.render(true);
      await waitForInput();
      await mockClickItem("inventory");

      // Verification
      expect(game.messages?.size).equal(0);
    });

    after(async () => {
      await cleanUpActorsKey(key);
      await trashChat();
    });
  });

  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_rollSave(event)", () => {
    const saves = ["death", "wand", "paralysis", "breath", "spell"];

    const clickSave = async (save: string) => {
      $(`li[data-save=${save}] a`).trigger("click");
      await delay(220);
    };

    describe(`character can roll`, () => {
      before(async () => {
        const actor = await createMockActorKey("character", {}, key);
        await actor?.sheet?.render(true);
        game.settings.set(game.system.id, "invertedCtrlBehavior", true);
        await trashChat();
        await delay(200);
      });

      saves.forEach((save) => {
        it(`${save} save`, async () => {
          await trashChat();
          await delay(200);
          expect(game.messages?.size).equal(0);
          await clickSave(save);
          expect(game.messages?.size).equal(1);
          expect(game.messages?.contents[0].content).contain(
            game.i18n.format("OSE.roll.save", {
              save: game.i18n.localize(`OSE.saves.${save}.long`),
            })
          );
        });
      });

      after(async () => {
        await cleanUpActorsKey(key);
        await trashChat();
        await delay(200);
      });
    });

    describe(`monster can roll`, () => {
      before(async () => {
        const actor = await createMockActorKey("monster", {}, key);
        await actor?.sheet?.render(true);
      });

      saves.forEach((save) => {
        it(`${save} save`, async () => {
          await trashChat();
          await delay(200);
          expect(game.messages?.size).equal(0);
          await clickSave(save);
          expect(game.messages?.size).equal(1);
          expect(game.messages?.contents[0].content).contain(
            game.i18n.format("OSE.roll.save", {
              save: game.i18n.localize(`OSE.saves.${save}.long`),
            })
          );
        });
      });

      after(async () => {
        await cleanUpActorsKey(key);
        await trashChat();
        await delay(200);
      });
    });
  });

  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_rollAttack(event)", () => {
    const attackTypeClasses = ["melee", "missile"];
    const clickAttack = async (attack: string) => {
      $(`li[data-attack=${attack}] a`).trigger("click");
      await delay(200);
    };

    before(async () => {
      game.settings.set(game.system.id, "invertedCtrlBehavior", true);
      const actor = await createMockActorKey("character", {}, key);
      actor?.sheet?.render(true);
      await trashChat();
    });

    attackTypeClasses.forEach((attackClass) => {
      it(`can attack with ${attackClass}`, async () => {
        const actor = await getActor();
        expect(game.messages?.size).equal(0);
        await clickAttack(attackClass);
        expect(game.messages?.size).equal(1);
        expect(game.messages?.contents[0].content).contain(
          game.i18n.format("OSE.roll.attacks", { name: actor?.name })
        );
        await trashChat();
      });
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });

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

    // Check that the target constructed properly
    expect(items.target.item).not.undefined;
    expect(items.target.item?.documentName).equal("Item");
    expect(items.target.item?.name).equal("TargetContainer");
  };

  const dragNDropCasePreflightCheck = (
    sourceItemName: string,
    items: DragNDropItems
  ) => {
    expect(items.source.item).not.undefined;
    expect(items.source.item?.documentName).equal("Item");
    expect(items.source.item?.name).equal(sourceItemName);

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
    expect(items.source.item?.system.containerId).equal(items.target.item?.id);

    // Check getters
    const getter =
      items.source.item?.type === "armor"
        ? items.source.item?.type
        : `${items.source.item?.type}s`;
    const amount = getter === "containers" ? 1 : 0;
    expect(documents.actor?.system[getter].length).equal(amount);
  };

  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_onContainerItemAdd(item, target)", () => {
    /* --------------------------------------------- */
    /* Loop over item types                          */
    /* --------------------------------------------- */
    itemTypes.forEach((itemType) => {
      // Skip items that can't be put in a container
      if (itemType === "spell") return;
      if (itemType === "ability") return;

      const documents: DragNDropDocuments = {} as DragNDropDocuments;
      const items: DragNDropItems = {
        source: {} as DragNDropItem,
        target: {} as DragNDropItem,
      } as DragNDropItems;

      before(async () => {
        documents.actor = await createMockActorKey("character", {}, key);

        // Create target container
        [items.target.item] = await createActorTestItem(
          documents.actor,
          "container",
          "TargetContainer"
        );
      });

      it(`add ${itemType} to container`, async () => {
        dragNDropSanityChecks(documents, items);

        // Create source item
        [items.source.item] = await createActorTestItem(
          documents.actor,
          itemType
        );

        // Perform pre-flight checks
        const sourceItemName = `New Actor Test ${itemType.capitalize()}`;
        dragNDropCasePreflightCheck(sourceItemName, items);

        // Perform operation
        // eslint-disable-next-line no-underscore-dangle
        await documents.actor?.sheet?._onContainerItemAdd(
          items.source.item,
          items.target.item
        );

        // Perform post-flight checks
        dragNDropCasePostflightCheck(documents, items);
      });

      after(async () => {
        await cleanUpActorsKey(key);
      });
    });
  });

  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_onContainerItemRemove(item, container)", () => {
    /* --------------------------------------------- */
    /* Loop over item types                          */
    /* --------------------------------------------- */
    itemTypes.forEach((itemType) => {
      // Skip items that can't be put in a container
      if (itemType === "spell") return;
      if (itemType === "ability") return;

      const documents: DragNDropDocuments = {} as DragNDropDocuments;
      const items: DragNDropItems = {
        source: {} as DragNDropItem,
        target: {} as DragNDropItem,
      } as DragNDropItems;

      before(async () => {
        documents.actor = await createMockActorKey("character", {}, key);

        // Create target container
        [items.target.item] = await createActorTestItem(
          documents.actor,
          "container",
          "TargetContainer"
        );

        // Create source item
        [items.source.item] = await createActorTestItem(
          documents.actor,
          itemType
        );

        // Perform operation
        // eslint-disable-next-line no-underscore-dangle
        await documents.actor?.sheet?._onContainerItemAdd(
          items.source.item,
          items.target.item
        );
      });

      it(`remove ${itemType} from container`, async () => {
        // Perform pre-flight checks
        dragNDropCasePostflightCheck(documents, items);

        // Perform operation
        // eslint-disable-next-line no-underscore-dangle
        await documents.actor?.sheet?._onContainerItemRemove(
          items.source.item,
          items.target.item
        );

        // Perform pre-flight checks
        const sourceItemName = `New Actor Test ${itemType.capitalize()}`;
        dragNDropCasePreflightCheck(sourceItemName, items);
      });

      after(async () => {
        await cleanUpActorsKey(key);
      });
    });
  });

  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_onDropItemCreate(droppedItem, targetContainer)", () => {
    /* --------------------------------------------- */
    /* Loop over item types                          */
    /* --------------------------------------------- */
    itemTypes.forEach((itemType) => {
      // Skip items that can't be put in a container
      if (itemType === "spell") return;
      if (itemType === "ability") return;

      const documents: DragNDropDocuments = {} as DragNDropDocuments;
      const items: DragNDropItems = {
        source: {} as DragNDropItem,
        target: {} as DragNDropItem,
      } as DragNDropItems;

      before(async () => {
        documents.actor = await createMockActorKey("character", {}, key);
      });

      it(`add non-actor ${itemType} to sheet`, async () => {
        // Create item in sidebar
        items.source.item = (await createWorldTestItem(itemType)) as OseItem;
        const sourceItemName = items.source.item.name || "test";

        // eslint-disable-next-line no-underscore-dangle
        await documents.actor?.sheet?._onDropItemCreate([items.source.item]);

        // Store new item as it recreates in the character sheet
        items.source.item = documents.actor?.items.getName(
          sourceItemName
        ) as OseItem;

        expect(items.source.item).not.undefined;
      });

      after(async () => {
        await cleanUpActorsKey(key);
      });
    });
  });

  describe("_chooseItemType(choices)", () => {
    const defaultChoices = ["weapon", "armor", "shield", "gear"];

    it("can create standard dialog", async () => {
      const actor = await createMockActorKey("monster", {}, key);
      // eslint-disable-next-line no-underscore-dangle
      actor?.sheet?._chooseItemType();
      await waitForInput();

      const dialogs = openDialogs();
      expect(dialogs.length).equal(1);

      defaultChoices.forEach((choice) => {
        expect(dialogs[0].data.content).contain(`<option value="${choice}"`);
      });
      await dialogs[0].close();
    });

    it("can create custom dialog", async () => {
      const customChoices = ["test", "test2", "test3"];
      const actor = (await createMockActorKey("monster", {}, key)) as OseActor;
      // eslint-disable-next-line no-underscore-dangle
      actor?.sheet?._chooseItemType(customChoices);
      await waitForInput();

      const dialogs = openDialogs();
      expect(dialogs.length).equal(1);

      customChoices.forEach((choice) => {
        expect(dialogs[0].data.content).contain(`<option value="${choice}"`);
      });
      await dialogs[0].close();
    });

    afterEach(async () => {
      await closeDialogs();
      await cleanUpActorsKey(key);
    });
  });

  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_createItem(event)", () => {
    itemTypes.forEach((itemType) => {
      it(`can create ${itemType}`, async () => {
        const actor = await createMockActorKey("character", {}, key);
        await actor?.update({ system: { spells: { enabled: true } } });
        await actor?.sheet?.render(true);
        await delay(200);
        expect(actor?.items.size).equal(0);

        $(`.sheet .item-create[data-type="${itemType}"]`).trigger("click");
        await waitForInput();

        expect(actor?.items.size).equal(1);
      });
    });

    afterEach(async () => {
      await cleanUpActorsKey(key);
    });
  });

  // @todo: Refactor to entity and just use event parsing in sheet
  describe("_updateItemQuantity(event)", () => {
    const updateQuantity = (element: HTMLInputElement, modifier: number) => {
      element.value = String(parseInt(element.value, 10) + modifier);
      const event = new InputEvent("change");
      element.dispatchEvent(event);
    };

    it("can add to the quantity", async () => {
      const actor = await createMockActorKey("character", {}, key);
      actor?.sheet?.render(true);
      const [item] = (await createActorTestItem(
        actor,
        "item"
      )) as unknown as OseItem;
      item.update({ system: { quantity: { value: 2, max: 4 } } });
      await waitForInput();

      const quantityElement = document.querySelector(
        `.sheet .item[data-item-id="${item.id}"] input[data-field="value"]`
      ) as HTMLInputElement;

      expect(item.system.quantity.value).equal(2);
      updateQuantity(quantityElement, 1);
      await waitForInput();
      expect(item.system.quantity.value).equal(3);
    });

    it("can subtract from the quantity", async () => {
      const actor = await createMockActorKey("character", {}, key);
      actor?.sheet?.render(true);
      const [item] = (await createActorTestItem(
        actor,
        "item"
      )) as unknown as OseItem;
      item.update({ system: { quantity: { value: 2, max: 4 } } });
      await waitForInput();

      const quantityElement = document.querySelector(
        `.sheet .item[data-item-id="${item.id}"] input[data-field="value"]`
      ) as HTMLInputElement;

      expect(item.system.quantity.value).equal(2);
      updateQuantity(quantityElement, -1);
      await waitForInput();
      expect(item.system.quantity.value).equal(1);
    });

    afterEach(async () => {
      await cleanUpActorsKey(key);
    });
  });

  // @todo: How to test?
  describe("_renderInner(...args)", () => {});
  // @todo: How to test?
  describe("_onResize(event)", () => {});

  // @todo: Dose this work now?
  describe("_onConfigureActor(event)", () => {
    ["character", "monster"].forEach((actorType) => {
      it(`Entity Tweaks renders for ${actorType}`, async () => {
        const actor = await createMockActorKey("character", {}, key);
        await actor?.sheet?.render(true);
        await delay(300);

        $(`.configure-actor`).trigger("click");
        await delay(300);

        const windows = openWindows("sheet-tweaks");
        expect(windows.length).equal(1);
        windows[0].close();
      });
    });

    afterEach(async () => {
      await cleanUpActorsKey(key);
    });
  });

  // @todo: How to test?
  describe("_getHeaderButtons()", () => {});
};
