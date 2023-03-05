/**
 * @file Contains tests for Ability Data Model.
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../../e2e";
import { cleanUpWorldItems, createWorldTestItem } from "../../../e2e/testUtils";

export const key = "ose.sheet.item";
export const options = { displayName: "Sheet: Item" };

export default ({ describe, it, expect, after, assert }: QuenchMethods) => {
  after(() => {
    cleanUpWorldItems();
  });

  describe("defaultOptions() ", () => {
    it("Has correctly set defaultOptions", async () => {
      const item = await createWorldTestItem("item");
      const sheet = item?.sheet;
      expect(sheet).is.not.undefined;
      expect(sheet?.options.classes.length).equal(3);
      expect(sheet?.options.classes).contain("ose");
      expect(sheet?.options.classes).contain("sheet");
      expect(sheet?.options.classes).contain("item");
      expect(sheet?.options.width).equal(520);
      expect(sheet?.options.height).equal(390);
      assert(!sheet?.options.resizable);
      expect(sheet?.options.tabs.length).equal(1);
      expect(Object.keys(sheet?.options.tabs[0]).length).equal(4);
      expect(Object.keys(sheet?.options.tabs[0])).contain("callback");
      expect(typeof sheet?.options.tabs[0].callback).equal("function");
      expect(sheet?.options.tabs[0].callback.name).contain("_onChangeTab");
      expect(Object.keys(sheet?.options.tabs[0])).contain("navSelector");
      expect(sheet?.options.tabs[0].navSelector).equal(".tabs");
      expect(Object.keys(sheet?.options.tabs[0])).contain("contentSelector");
      expect(sheet?.options.tabs[0].contentSelector).equal(".sheet-body");
      expect(Object.keys(sheet?.options.tabs[0])).contain("initial");
      expect(sheet?.options.tabs[0].initial).equal("description");
    });
  });

  describe("template()", () => {
    it("Returns html path", async () => {
      const item = await createWorldTestItem("item");
      const sheet = item?.sheet;
      expect(sheet).is.not.undefined;
      expect(sheet?.template).contain("templates/items");
      expect(sheet?.template).contain("-sheet.html");
    });
  });

  describe("getData()", () => {
    it("Returns data", async () => {
      const item = await createWorldTestItem("item");
      const sheet = item?.sheet;
      expect(sheet).is.not.undefined;
      const data = await sheet?.getData();
      expect(Object.keys(data)).contain("_id");
      expect(Object.keys(data)).contain("editable");
      expect(Object.keys(data)).contain("config");
      expect(Object.keys(data)).contain("enriched");
    });
  });
};
