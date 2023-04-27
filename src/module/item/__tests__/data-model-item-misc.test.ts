/**
 * @file Contains tests for Misc Item Data Model.
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../../e2e";
import OseDataModelItem from "../data-model-item";

export const key = "ose.item.datamodel.misc";
export const options = { displayName: "OSE: Item: Data Model: Misc" };

export default ({ describe, it, expect }: QuenchMethods) => {
  describe("manualTags()", () => {
    const miscItem = new OseDataModelItem();
    it("By default return empty array", () => {
      expect(miscItem.manualTags.length).equal(0);
    });

    it("Can write tags to tags field", () => {
      miscItem.tags = [{ title: "title", value: "value" }];
      expect(miscItem.tags.length).equal(1);
      expect(Object.keys(miscItem.tags[0]).length).equal(2);
      expect(miscItem.tags[0].title).equal("title");
      expect(miscItem.tags[0].value).equal("value");
      expect(miscItem.tags[0].label).is.undefined;
    });

    it("Can retrieve tags", () => {
      expect(miscItem.manualTags.length).equal(1);
      expect(miscItem.manualTags[0].title).equal("title");
      expect(miscItem.manualTags[0].value).equal("value");
      expect(miscItem.tags[0].label).is.undefined;
    });
  });

  describe("autoTags()", () => {
    const miscItem = new OseDataModelItem();
    it("By default return no auto-tags", () => {
      expect(miscItem.autoTags.length).equal(0);
    });

    it("Can create autoTags", () => {
      miscItem.tags = [{ value: CONFIG.OSE.tags.blunt }];
      expect(miscItem.tags.length).equal(1);
      expect(miscItem.autoTags[0].label).equal(CONFIG.OSE.tags.blunt);
      expect(miscItem.autoTags[0].icon).equal("fa-hammer-crash");
      expect(miscItem.autoTags[0].image).equal(
        `${CONFIG.OSE.assetsPath}/blunt.png`
      );
    });
  });
};
