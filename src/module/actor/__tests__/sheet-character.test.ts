/**
 * @file Contains tests for Character Sheet.
 */
// eslint-disable-next-line import/no-cycle
import { QuenchMethods } from "../../../e2e";
import {
  cleanUpActorsKey,
  closeDialogs,
  closeSheets,
  createMockActorKey,
  delay,
  openDialogs,
  openWindows,
  trashChat,
  waitForInput,
} from "../../../e2e/testUtils";
import OseActorSheetCharacter from "../character-sheet";

export const key = "ose.sheet.character";
export const options = { displayName: "Sheet: Character" };

export default ({ describe, it, expect, after, afterEach }: QuenchMethods) => {
  after(async () => {
    await cleanUpActorsKey(key);
    await closeSheets();
  });

  describe("defaultOptions()", () => {
    it("Has correctly set defaultOptions", async () => {
      const actor = await createMockActorKey("character", {}, key);
      const sheet = actor?.sheet as unknown as OseActorSheetCharacter;

      expect(sheet.options.classes).contain("ose");
      expect(sheet.options.classes).contain("sheet");
      expect(sheet.options.classes).contain("actor");
      expect(sheet.options.classes).contain("character");

      expect(sheet.options.template).contain(
        "/templates/actors/character-sheet.html"
      );
      expect(sheet.options.width).equal(450);
      expect(sheet.options.height).equal(530);
      expect(sheet.options.resizable).is.true;

      expect(sheet.options.tabs.length).equal(1);
      expect(Object.keys(sheet.options.tabs[0])).contain("navSelector");
      expect(sheet.options.tabs[0].navSelector).equal(".sheet-tabs");
      expect(Object.keys(sheet.options.tabs[0])).contain("contentSelector");
      expect(sheet.options.tabs[0].contentSelector).equal(".sheet-body");
      expect(Object.keys(sheet.options.tabs[0])).contain("initial");
      expect(sheet.options.tabs[0].initial).equal("attributes");

      expect(sheet.options.scrollY.length).equal(1);
      expect(sheet.options.scrollY[0]).equal(".inventory");
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });

  // @todo: Do we need separate test sfor this, or is getData() enough?
  describe("_prepareItems(data)", () => {});

  // @todo: this is not tested separately as a dialog, should we test it more?
  describe("generateScores()", () => {
    const scores = {
      str: 0,
      int: 0,
      dex: 0,
      wis: 0,
      con: 0,
      cha: 0,
    };

    it("renders the character creator", async () => {
      const actor = await createMockActorKey("character", {}, key);
      const sheet = actor?.sheet as unknown as OseActorSheetCharacter;

      sheet.generateScores();
      await waitForInput();

      const windows = openWindows("creator");
      expect(windows.length).equal(1);
    });

    it("clicking on the dices generates scores", async () => {
      const actor = await createMockActorKey("character", {}, key);
      const sheet = actor?.sheet as unknown as OseActorSheetCharacter;

      sheet.generateScores();
      await delay(400);

      const windows = openWindows("creator");
      expect(windows.length).equal(1);

      Object.keys(scores).forEach(async (score) => {
        $(`.creator div[data-score="${score}"] a.score-roll`).trigger("click");
        await waitForInput();

        const scoreValue = document.querySelector(
          `.creator div[data-score="${score}"] input.score-value`
        );
        const { value } = scoreValue;
        expect(parseInt(value, 10) > 0).equal(true);
      });
    });

    // @todo: this needs fixing
    it("saving scores records data to actor", async () => {
      const actor = await createMockActorKey("character", {}, key);
      const sheet = actor?.sheet as unknown as OseActorSheetCharacter;

      sheet.generateScores();
      await delay(400);

      const windows = openWindows("creator");
      expect(windows.length).equal(1);

      Object.keys(scores).forEach(async (score) => {
        $(`.creator div[data-score="${score}"] a.score-roll`).trigger("click");
        await waitForInput();

        const scoreValue = document.querySelector(
          `.creator div[data-score="${score}"] input.score-value`
        );
        const { value } = scoreValue;
        expect(parseInt(value, 10) > 0).equal(true);
        scores[score] = parseInt(value, 10);
      });

      $(`.creator footer button`).trigger("submit");
      await waitForInput();

      expect(actor?.system.scores.str.value).equal(scores.str);
      expect(actor?.system.scores.dex.value).equal(scores.dex);
      expect(actor?.system.scores.wis.value).equal(scores.wis);
      expect(actor?.system.scores.int.value).equal(scores.int);
      expect(actor?.system.scores.con.value).equal(scores.con);
      expect(actor?.system.scores.cha.value).equal(scores.cha);
    });

    // @todo: Auto-roll testing
    // @todo: Gold rolling testing

    afterEach(async () => {
      await trashChat();
      await cleanUpActorsKey(key);
      const windows = openWindows("creator");
      windows.forEach((w) => w.close());
      await delay(300);
    });
  });

  describe("getData()", () => {
    it("returns the expected data", async () => {
      const actor = await createMockActorKey("character", {}, key);
      const data = await actor?.sheet?.getData();

      expect(Object.keys(data)).contain("enrichedBiography");
      expect(Object.keys(data)).contain("enrichedNotes");

      // _prepareItems tests
      expect(Object.keys(data)).contain("owned");
      expect(Object.keys(data?.owned)).contain("weapons");
      expect(Object.keys(data?.owned)).contain("items");
      expect(Object.keys(data?.owned)).contain("containers");
      expect(Object.keys(data?.owned)).contain("armors");
      expect(Object.keys(data?.owned)).contain("treasures");
      expect(Object.keys(data)).contain("containers");
      expect(Object.keys(data)).contain("abilities");
      expect(Object.keys(data)).contain("spells");
      expect(Object.keys(data)).contain("slots");
      expect(Object.keys(data)).contain("system");
      expect(Object.keys(data?.system)).contain("usesAscendingAC");
      expect(Object.keys(data?.system)).contain("meleeMod");
      expect(Object.keys(data?.system)).contain("rangedMod");
      expect(Object.keys(data?.system)).contain("init");
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });

  describe("_chooseLang()", () => {
    it("renders a dialog", async () => {
      const actor = await createMockActorKey("character", {}, key);
      // eslint-disable-next-line no-underscore-dangle
      actor?.sheet?._chooseLang();
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
  describe("_pushLang(table)", () => {
    const table = "languages";

    it("renders a dialog", async () => {
      const actor = await createMockActorKey("character", {}, key);
      // eslint-disable-next-line no-underscore-dangle
      actor?.sheet?._pushLang(table);
      await waitForInput();

      const dialogs = openDialogs();
      expect(dialogs.length).equal(1);
      dialogs[0].close();
    });

    it("adds language on OK", async () => {
      const actor = await createMockActorKey("character", {}, key);
      // eslint-disable-next-line no-underscore-dangle
      actor?.sheet?._pushLang(table);
      await delay(220);

      $(`button.ok`).trigger("click");
      await delay(500);

      const dialogs = openDialogs();
      expect(dialogs.length).equal(0);

      expect(actor?.system.languages.value.length).equal(1);
      expect(actor?.system.languages.value[0]).equal("Common");
    });

    after(async () => {
      await cleanUpActorsKey(key);
      await closeDialogs();
    });
  });

  describe("_popLang(table, lang)", () => {
    const table = "languages";

    it("can remove added language", async () => {
      const actor = await createMockActorKey("character", {}, key);
      await actor?.update({ "system.languages.value": ["Common"] });
      await waitForInput();

      expect(actor?.system.languages.value.length).equal(1);
      expect(actor?.system.languages.value[0]).equal("Common");

      // eslint-disable-next-line no-underscore-dangle
      actor?.sheet?._popLang(table, "Common");
      await waitForInput();

      expect(actor?.system.languages.value.length).equal(0);
    });

    after(async () => {
      await cleanUpActorsKey(key);
    });
  });

  describe("_onShowModifiers(event)", () => {
    it("renders a dialog", async () => {
      const actor = await createMockActorKey("character", {}, key);
      await actor?.update({
        system: {
          scores: {
            str: { value: 10 },
            dex: { value: 10 },
            int: { value: 10 },
            con: { value: 10 },
            wis: { value: 10 },
            cha: { value: 10 },
          },
        },
      });
      actor?.sheet?.render(true);
      await waitForInput();

      $(`.sheet .profile a[data-action=modifiers]`).trigger("click");
      await delay(200);

      const dialogs = openDialogs();
      expect(dialogs.length).equal(1);
    });

    after(async () => {
      await cleanUpActorsKey(key);
      await closeDialogs();
      await delay(400);
    });
  });

  describe("_onShowGpCost(event, preparedData)", () => {
    it("renders a dialog", async () => {
      const actor = await createMockActorKey("character", {}, key);
      await actor?.update({
        system: {
          scores: {
            str: { value: 10 },
            dex: { value: 10 },
            int: { value: 10 },
            con: { value: 10 },
            wis: { value: 10 },
            cha: { value: 10 },
          },
        },
      });
      actor?.sheet?.render(true);
      await waitForInput();

      $(`.sheet .profile a[data-action=gp-cost]`).trigger("click");
      await delay(200);

      const dialogs = openDialogs();
      expect(dialogs.length).equal(1);
    });

    after(async () => {
      await cleanUpActorsKey(key);
      await closeDialogs();
      await delay(400);
    });
  });

  // @todo: This seems unfinished
  describe("_onShowItemTooltip(event)", () => {});
};
