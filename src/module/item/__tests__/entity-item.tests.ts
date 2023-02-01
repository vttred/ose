// eslint-disable-next-line eslint-comments/disable-enable-pair
// eslint-disable @typescript-eslint/no-unused-expressions, import/no-cycle

/**
 * @file Contains tests for Item Data Model.
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../../e2e";
// eslint-disable-next-line prettier/prettier
import { trashChat, waitForInput } from "../../../e2e/testUtils";
import OseActor from "../../actor/entity";
import OseItem from "../entity";

export const key = "ose.entity.item";
export const options = { displayName: "Entity: Item" };

const openDialogs = () =>
  Object.values(ui.windows).filter((o) => o.options.classes.includes("dialog"));

/**
 * If there are dialogs, close them.
 *
 * @returns {Promise<void>} the promise from closing dialogs
 */
const closeRollDialog = async () => {
  const dialogs = openDialogs();

  dialogs.forEach(async (o) => {
    await o.close();
  });
  return true;
};

const createMockActor = async (data: object = {}) =>
  Actor.create({
    ...data,
    name: `Test Actor ${key}`,
    type: "character",
  });

const createMockActorItem = async (actor: OseActor, type: string) =>
  actor.createEmbeddedDocuments("Item", [
    {
      name: `Test ${type.capitalize()} Item ${foundry.utils.randomID()}`,
      type,
    },
  ]);

const createMockItem = async (type: string) =>
  OseItem.create({
    name: `Test ${type.capitalize()} Item ${foundry.utils.randomID()}`,
    type,
  });

export default ({
  describe,
  it,
  expect,
  after,
  beforeEach,
  assert,
}: QuenchMethods) => {
  const itemTypes = new Set([
    "spell",
    "ability",
    "armor",
    "weapon",
    "item",
    "container",
  ]);

  const { defaultIcons } = OseItem;

  after(async () => {
    game.items
      ?.filter(
        (o) => o.name?.indexOf("Test") >= 0 && o.name?.indexOf("Item") >= 0
      )
      .forEach((i) => i.delete());
  });

  describe("defaultIcons()", () => {
    it("There are 6 default icons", () =>
      expect(Object.keys(defaultIcons).length).equal(6));

    itemTypes.forEach((type: string) => {
      it(`Has ${type} icon`, () => expect(defaultIcons[type]).is.not.undefined);
    });

    it("Asking for other items return null", () =>
      expect(defaultIcons.non_existing).is.undefined);
  });

  describe("create()", () => {
    const testItemCreate = async (type: string) => {
      const item = await createMockItem(type);
      expect(item).is.not.undefined;
      expect(item?.img).equals(defaultIcons[type]);
      const itemName = item?.name;
      await item?.delete();
      expect(game.items?.find((o) => o.name === itemName)).is.undefined;
    };

    it("Can create weapon OseItem", async () => {
      await testItemCreate("weapon");
    });
    it("Can create armor OseItem", async () => {
      await testItemCreate("armor");
    });
    it("Can create item OseItem", async () => {
      await testItemCreate("item");
    });
    it("Can create spell OseItem", async () => {
      await testItemCreate("spell");
    });
    it("Can create ability OseItem", async () => {
      await testItemCreate("ability");
    });
    it("Can create container OseItem", async () => {
      await testItemCreate("container");
    });

    // Requires chai-as-promised
    /*
    it('Can\'t create without name', async () => {
      await expect(OseItem.create({type: 'container'})).to.be.rejectedWith(
        Error, 
        "[OseItem.name] may not be a blank string")
    })
    it('Can\'t create without type', async () => {
      await expect(OseItem.create({name: 'Test Item'})).to.be.rejectedWith(
        Error, 
        "[OseItem.type] may not be a blank string")
    })
    it('Can\'t create without acceptable type', async () => {
      await expect(OseItem.create({name: 'Test Item', type: 'TEST'})).to.be.rejectedWith(
        Error, 
        "[OseItem.type] TEST is not a valid choice")
    }) 
    */
  });

  /*
  // How to test?
  describe('prepareData()', () => {});

  // How to test?
  describe('prepareDerivedData()', () => {});
  */

  /*
  // How to mock html?     
  describe('chatListeners(html)', () => {
    it('Correctly binds _onChatCardAction to element', () => { assert(false) })
    it('Correctly binds _onChatCardToggleContent to element', () => { assert(false) })
  }); 
  */

  /*
  describe('getChatData(htmlOptions)', () => {
    it('Weapon with tags correctly stored in item.system.properties', () => { assert(false) })
    it('Spell stores class, level, range, and duration in item.system.properties', () => { assert(false) })
    it('Equipped item stores "Equipped" in item.system.properties', () => { assert(false) })
    it('Properly returns itemData', () => { assert(false) })
  });
  */

  describe("rollWeapon(options)", () => {
    it("Actor with melee & missile weapon renders dialog", async () => {
      const actor: OseActor = await createMockActor();
      await createMockActorItem(actor, "weapon");
      const weapon: OseItem = actor?.items.contents[0];
      await weapon?.update({ system: { melee: true, missile: true } });
      const result = weapon.rollWeapon();
      await waitForInput();
      actor.delete();
      expect(openDialogs().length).equal(1);
      assert(result);
      await closeRollDialog();
      await waitForInput();
      await waitForInput();
      await waitForInput();
      expect(openDialogs().length).equal(0);
    });
    it("Actor with weapon with ", async () => {
      const actor: OseActor = await createMockActor();
      await createMockActorItem(actor, "weapon");
      const weapon: OseItem = actor?.items.contents[0];
      await weapon?.update({ system: { missile: true, melee: false } });
      const result = weapon.rollWeapon();
      actor.delete();
      assert(result);
    });
  });

  describe("rollFormula(options)", () => {
    it("Missing item.system.roll throws error", async () => {
      const item: OseItem = await createMockItem("item");
      try {
        await item.rollFormula();
      } catch (error: any) {
        expect(error.name).equal("Error");
      }
    });
    it("Casting a spell trigger a dialog", async () => {
      const item: OseItem = await createMockItem("spell");
      await item.update({ system: { roll: "1d20+12" } });
      await item.rollFormula();
      await waitForInput();
      await waitForInput();
      await waitForInput();
      expect(openDialogs().length).equal(1);
      await closeRollDialog();
      await trashChat();
    });
    it("A OseDice.Roll is returned from method", async () => {
      const item: OseItem = await createMockItem("spell");
      await item.update({ system: { roll: "1d20+12" } });
      const result: any = await item.rollFormula();
      assert(result instanceof Roll);
    });
  });

  describe("spendSpell()", () => {
    it("Calling using non-spell item throws an error", async () => {
      const item: OseItem = await createMockItem("weapon");
      try {
        await item.spendSpell();
      } catch (error: unknown) {
        expect(error.name).equal("Error");
      }
    });
    it("Calling function reduces item.system.cast by one", async () => {
      const item: OseItem = await createMockItem("spell");
      const initialSlots: Number = 3;
      await item.update({ system: { cast: initialSlots } });
      await item.spendSpell();
      expect(item?.system?.cast).equal(initialSlots - 1);
    });
  });

  describe("_getRollTag(data)", () => {
    it("Data provided without a roll key returns void", async () => {
      const item: OseItem = await createMockItem("weapon");
      // eslint-disable-next-line no-underscore-dangle
      const tag = item._getRollTag({});
      expect(tag).to.be.undefined;
    });
    it("Returns ab object with value containing roll-info", async () => {
      const item: OseItem = await createMockItem("weapon");
      // eslint-disable-next-line no-underscore-dangle
      const tag = item._getRollTag({ roll: "1d12+4" });
      expect(tag).not.to.be.undefined;
      expect(tag?.label).equal("Roll 1d12+4");
    });
  });

  describe("_getSaveTag(data)", () => {
    it("Data provided without a save key returns void", async () => {
      const item: OseItem = await createMockItem("weapon");
      // eslint-disable-next-line no-underscore-dangle
      const tag = item._getSaveTag({});
      expect(tag).to.be.undefined;
    });
    it("Returns an object with two keys; label and icon", async () => {
      const item: OseItem = await createMockItem("weapon");
      // eslint-disable-next-line no-underscore-dangle
      const tag = item._getSaveTag({ save: "death" });
      expect(tag).not.to.be.undefined;
      expect(tag?.label).equal("Death Poison");
      expect(tag?.icon).equal("fa-skull");
    });
  });

  describe("pushManualTag(values)", () => {
    const testPushManualTag = async (
      item: OseItem,
      tag: string,
      itemTagData: { label: string; title: string; value: string }
      // eslint-disable-next-line unicorn/consistent-function-scoping
    ) => {
      expect(item?.system?.tags.length).equal(0);
      await item?.pushManualTag([tag]);
      expect(item?.system?.tags.length).equal(1);
      const itemTag = item?.system?.tags?.pop();
      expect(itemTag.label).equal(itemTagData.label);
      expect(itemTag.title).equal(itemTagData.title);
      expect(itemTag.value).equal(itemTagData.value);
    };

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const pushManualTag = async (item: OseItem, tag: string) => {
      expect(item?.system?.tags.length).equal(0);
      await item?.pushManualTag([tag]);
    };

    const testSystemBooleans = (
      item: OseItem,
      flags: { melee: boolean; slow: boolean; missile: boolean }
    ) => {
      expect(item.system.melee).equal(flags.melee);
      expect(item.system.slow).equal(flags.slow);
      expect(item.system.missile).equal(flags.missile);
    };

    it("Provided value without () adds value to all keys", async () => {
      const item: OseItem = await createMockItem("weapon");
      await testPushManualTag(item, "test", {
        label: "test",
        title: "test",
        value: "test",
      });
      item.delete();
    });
    it("Provided values have tags within () added to array as title", async () => {
      const item: OseItem = await createMockItem("weapon");
      await testPushManualTag(item, "test (test2)", {
        label: "test",
        title: "test2",
        value: "test",
      });
      item.delete();
    });

    // Default
    it("Weapons are automatically melee", async () => {
      const item: OseItem = await createMockItem("weapon");
      testSystemBooleans(item, { melee: true, slow: false, missile: false });
      await item?.delete();
    });

    // Boolean tags
    const booleanTags = new Set([
      CONFIG.OSE.tags.melee,
      CONFIG.OSE.tags.slow,
      CONFIG.OSE.tags.missile,
    ]);

    booleanTags.forEach((t) => {
      it(`"${t}" tag activates the boolean but not a tag`, async () => {
        const item: OseItem = await createMockItem("weapon");
        await pushManualTag(item, t);
        testSystemBooleans(item, {
          melee: true,
          slow: t === CONFIG.OSE.tags.slow,
          missile: t === CONFIG.OSE.tags.missile,
        });
        item.delete();
      });
      it(`"Test (${t})" tags activates the boolean and adds a tag`, async () => {
        const item: OseItem = await createMockItem("weapon");
        await testPushManualTag(item, `Test (${t})`, {
          label: "Test",
          title: t,
          value: "Test",
        });
        testSystemBooleans(item, {
          melee: true,
          slow: t === CONFIG.OSE.tags.slow,
          missile: t === CONFIG.OSE.tags.missile,
        });
        item.delete();
      });
    });
  });

  describe("popManualTag(value)", () => {
    it("Item without system.tags return undefined", async () => {
      const item: OseItem = await createMockItem("weapon");
      expect(item.system.tags.length).equal(0);
      const poppedTag = await item.popManualTag("test");
      expect(poppedTag).equal(undefined);
    });
    it("Tags matching input value are removed from item.system.tags", async () => {
      const item: OseItem = await createMockItem("weapon");
      expect(item.system.tags.length).equal(0);

      await item.pushManualTag(["test", "test2"]);
      expect(item.system.tags.length).equal(2);

      await item.popManualTag("test");
      expect(item.system.tags.length).equal(1);
      expect(item.system.tags.pop().title).equal("test2");
    });
  });

  describe("getAutoTagList()", () => {
    it("Container does nothing", async () => {
      const item: OseItem = await createMockItem("container");
      const tagList = item.getAutoTagList();
      expect(tagList.length).equal(0);
      item.delete();
    });
    it("Item does nothing", async () => {
      const item: OseItem = await createMockItem("item");
      const tagList = item.getAutoTagList();
      expect(tagList.length).equal(0);
      item.delete();
    });
    it("Weapon has damage label applied", async () => {
      const item: OseItem = await createMockItem("weapon");
      const tagList = item.getAutoTagList();
      expect(tagList.length).equal(1);
      expect(tagList[0].icon).equal("fa-tint");
      expect(tagList[0].label).equal("1d6");
      item.delete();
    });
    it("Missile weapon has ranges applied", async () => {
      const item: OseItem = await createMockItem("weapon");
      await item.pushManualTag([CONFIG.OSE.tags.missile]);
      assert(item.system.missile);
      const tagList = item.getAutoTagList();
      expect(tagList.length).equal(2);
      expect(tagList[0].icon).equal("fa-tint");
      expect(tagList[0].label).equal("1d6");
      expect(tagList[1].icon).equal("fa-bullseye");
      expect(tagList[1].label).equal("0/0/0");
      item.delete();
    });
    it("Manual weapon tags are applied", async () => {
      const item: OseItem = await createMockItem("weapon");
      await item.pushManualTag(["Test"]);
      const tagList = item.getAutoTagList();
      expect(tagList.length).equal(2);
      expect(tagList[0].icon).equal("fa-tint");
      expect(tagList[0].label).equal("1d6");
      expect(tagList[1].label).equal("Test");
      item.delete();
    });
    it("Default Armor has armor type applied", async () => {
      const item: OseItem = await createMockItem("armor");
      const tagList = item.getAutoTagList();
      expect(tagList.length).equal(1);
      expect(tagList[0].icon).equal("fa-tshirt");
      expect(tagList[0].label).equal("Light");
      item.delete();
    });
    it("Heavy Armor has armor type applied", async () => {
      const item: OseItem = await createMockItem("armor");
      await item.update({ system: { type: "heavy" } });
      const tagList = item.getAutoTagList();
      expect(tagList.length).equal(1);
      expect(tagList[0].icon).equal("fa-tshirt");
      expect(tagList[0].label).equal("Heavy");
      item.delete();
    });
    it("Spells have class, range, and duration applied", async () => {
      const item: OseItem = await createMockItem("spell");
      const tagList = item.getAutoTagList();
      expect(tagList.length).equal(3);
      expect(tagList[0].label).equal("Magic-User");
      expect(tagList[1].label).equal("");
      expect(tagList[2].label).equal("");
      item.delete();
    });
    it("Abilities have requirements applied", async () => {
      const item: OseItem = await createMockItem("ability");
      await item.update({ system: { requirements: "alice,bob" } });
      const tagList = item.getAutoTagList();
      expect(tagList.length).equal(2);
      expect(tagList[0].label).equal("alice");
      expect(tagList[1].label).equal("bob");
      item.delete();
    });
    it("If rollTag exists, it is applied", async () => {
      const item: OseItem = await createMockItem("spell");
      await item.update({ system: { roll: "1d20+12" } });
      const tagList = item.getAutoTagList();
      expect(tagList.length).equal(4);
      expect(tagList[3].label).equal("Roll 1d20+12");
      item.delete();
    });
    it("If saveTag exists, it is applied", async () => {
      const item: OseItem = await createMockItem("spell");
      await item.update({ system: { save: "death" } });
      const tagList = item.getAutoTagList();
      expect(tagList.length).equal(4);
      expect(tagList[3].label).equal("Death Poison");
      expect(tagList[3].icon).equal("fa-skull");
      item.delete();
    });
  });

  // @todo How to test?
  /*
  describe('roll(options)', () => {
    it('Item of weapon type activates rollWeapon', async () => {})
    it('Item of spell type activates spendSpell', () => { assert(false) })
    it('Item of ability type activates rollFormula if it has associated item.system.roll', () => { assert(false) })
    it('Item of ability type shows chat card if no item.system.roll associated', () => { assert(false) })
    it('Item of item type shows chat card', () => { assert(false) })
    it('Item of armor type shows chat card', () => { assert(false) })
  });
  */

  describe("show()", () => {
    beforeEach(async () => {
      await trashChat();
    });

    after(async () => {
      game.items
        ?.filter((o) => o?.name?.indexOf("Test Weapon Item ") >= 0 || false)
        .forEach(async (i) => i.delete());
      await trashChat();
    });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const rollMessageTest = async (rollMode: string) => {
      assert(
        ["publicroll", "gmroll", "blindroll", "selfroll"].includes(rollMode)
      );
      expect(game.messages?.size).equal(0);
      game.settings.set("core", "rollMode", rollMode);
      expect(game.settings.get("core", "rollMode")).equal(rollMode);
      const item: OseItem = await createMockItem("weapon");
      await item?.show();
      expect(game.messages?.size).equal(1);
      const chatMessage = game.messages?.contents.pop();
      expect(chatMessage?.blind).equal(rollMode === "blindroll");
      expect(chatMessage?.type).equal(0);
      if (rollMode === "publicroll") {
        expect(chatMessage?.whisper?.length).equal(0);
      } else {
        chatMessage?.whisper?.forEach((o: string) => {
          // eslint-disable-next-line no-underscore-dangle
          assert(game.users?.find((u: User) => u._id === o)?.isGM);
        });
      }
      await item?.delete();
    };

    it("Private GM Roll whispers chat message to GM", async () => {
      await rollMessageTest("gmroll");
    });

    it("Blindroll whispers chat message to GM and is blind", async () => {
      await rollMessageTest("blindroll");
    });

    it("Selfroll whispers chat message to user", async () => {
      await rollMessageTest("selfroll");
    });
    it("Public messages is not a whisper and is not blind", async () => {
      await rollMessageTest("publicroll");
    });
  });

  /*
  // e2e
  describe('_onChatCardToggleContent(event)', () => { });
  describe('_onChatCardAction(event)', () => { });

  describe('_getChatCardActor(card)', () => {
    it('Returns actor if tokenId is properly set', () => { assert(false) })
    it('Returns actor if actorId is properly set', () => { assert(false) })
    it('Returns null if neither tokenId nor actorId is properly set', () => { assert(false) })
  });

  // e2e
  describe('_getChatCardTargets(card)', () => { });
  */
};
