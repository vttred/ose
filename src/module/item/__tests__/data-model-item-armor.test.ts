/**
 * @file Contains tests for Armor Item Data Model.
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../../e2e";
import OseDataModelArmor from "../data-model-armor";

export const key = "ose.item.datamodel.armor";
export const options = { displayName: "OSE: Item: Data Model: Armor" };

export default ({ describe, it, expect }: QuenchMethods) => {
  describe("ArmorTypes", () => {
    const dataTypes = OseDataModelArmor.ArmorTypes;

    it("Has 4 armor types", () => {
      expect(Object.keys(dataTypes).length).equal(4);
    });
    it("Has unarmored", () => {
      expect(dataTypes.unarmored).equal("OSE.armor.unarmored");
    });
    it("Has light", () => {
      expect(dataTypes.light).equal("OSE.armor.light");
    });
    it("Has heavy", () => {
      expect(dataTypes.heavy).equal("OSE.armor.heavy");
    });
    it("Has shield", () => {
      expect(dataTypes.shield).equal("OSE.armor.shield");
    });
  });

  describe("manualTags", () => {
    const item = new OseDataModelArmor();

    it("By default return empty array", () => {
      expect(item.manualTags.length).equal(0);
    });

    it("Can write tags to tags field", () => {
      item.tags = [{ title: "title", value: "value" }];
      expect(item.tags.length).equal(1);
      expect(Object.keys(item.tags[0]).length).equal(2);
      expect(item.tags[0].title).equal("title");
      expect(item.tags[0].value).equal("value");
      expect(item.tags[0].label).is.undefined;
    });

    it("Can retrieve tags", () => {
      expect(item.manualTags.length).equal(1);
      expect(Object.keys(item.tags[0]).length).equal(2);
      expect(item.manualTags[0].title).equal("title");
      expect(item.manualTags[0].value).equal("value");
      expect(item.manualTags[0].label).equal("value");
    });
  });

  describe("autoTags", () => {
    const item = new OseDataModelArmor();

    it("By default return auto-tags", () => {
      expect(item.autoTags.length).equal(1);
      expect(Object.keys(item.autoTags[0]).length).equal(2);
    });
    it("By default return light armor", () => {
      expect(item.autoTags[0].label).equal("OSE.armor.light");
    });
    it("By default return tshirt icon", () => {
      expect(item.autoTags[0].icon).equal("fa-tshirt");
    });
  });
};
