/**
 * @file Contains tests for Ability Data Model.
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../../e2e";
import OseDataModelAbility from "../data-model-ability";

export const key = "ose.datamodel.item.ability";
export const options = { displayName: "Item Data Model: Ability" };

export default ({ describe, it, expect }: QuenchMethods) => {
  describe("manualTags", () => {
    const ability = new OseDataModelAbility();
    it("By default return empty array", () => {
      expect(ability.manualTags.length).equal(0);
    });
    it("Can write tags to tags field", () => {
      ability.tags = [{ title: "title", value: "value" }];
      expect(ability.tags.length).equal(1);
      expect(Object.keys(ability.tags[0]).length).equal(2);
      expect(ability.tags[0].title).equal("title");
      expect(ability.tags[0].value).equal("value");
      expect(ability.tags[0].label).is.undefined;
    });
    it("Can retrieve tags", () => {
      expect(ability.manualTags.length).equal(1);
      expect(ability.manualTags[0].title).equal("title");
      expect(ability.manualTags[0].value).equal("value");
      expect(ability.tags[0].label).is.undefined;
    });
  });

  describe("autoTags", () => {
    const ability = new OseDataModelAbility();
    it("By default return auto-tags", () => {
      expect(ability.autoTags.length).equal(1);
      expect(Object.keys(ability.autoTags[0]).length).equal(1);
    });
    it("By default return empty label", () => {
      expect(ability.autoTags[0].label).equal("");
    });
    it("By default return tshirt icon", () => {
      expect(ability.autoTags[0].icon).is.undefined;
    });
    it("Requirements create autoTags", () => {
      ability.requirements = "magic-user,slow";
      expect(ability.autoTags.length).equal(2);
      expect(Object.keys(ability.autoTags[0]).length).equal(1);
      expect(ability.autoTags[0].label).equal("magic-user");
      expect(Object.keys(ability.autoTags[1]).length).equal(1);
      expect(ability.autoTags[1].label).equal("slow");
    });
    it("Save create autoTags", () => {
      ability.save = "death";
      expect(ability.autoTags.length).equal(3);
      expect(Object.keys(ability.autoTags[2]).length).equal(2);
      // expect(ability.autoTags[2].label).equal("Death Poison"); // Localized
      expect(ability.autoTags[2].icon).equal("fa-skull");
    });
    it("Roll create autoTags", () => {
      ability.roll = "1d20+1";
      expect(ability.autoTags.length).equal(4);
      expect(Object.keys(ability.autoTags[3]).length).equal(2);
      // expect(ability.autoTags[2].label).equal("Roll 1d20+1 undefinednull"); // Localized
    });
  });
};
