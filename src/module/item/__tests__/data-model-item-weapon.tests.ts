/**
 * @file Contains tests for Weapon Item Data Model.
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../../e2e";
import OseDataModelWeapon from "../data-model-weapon";

export const key = "ose.datamodel.item.weapon";
export const options = { displayName: "Item Data Model: Weapon" };

export default ({ describe, it, expect }: QuenchMethods) => {
  describe("manualTags()", () => {
    const item = new OseDataModelWeapon();
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
      expect(item.manualTags[0].label).is.undefined;
    });
  });
  describe("qualities()", () => {
    it("By default returns an empty array", () => {
      const item = new OseDataModelWeapon();
      expect(item.qualities.length).equal(0);
    });
    it("Given a manual tag, it returns an array containing said tag", () => {
      const item = new OseDataModelWeapon();
      item.tags = [{ value: "slow", label: "slow" }];
      expect(item.qualities.length).equal(1);
      expect(Object.keys(item.qualities[0]).length).equal(2);
      expect(item.qualities[0].label).equal(item.manualTags[0].label);
      expect(item.qualities[0].value).equal(item.manualTags[0].value);
    });
    it("Given a autoTag, it returns an array containing said autoTag", () => {
      const item = new OseDataModelWeapon();
      item.slow = true;
      expect(item.qualities.length).equal(1);
      expect(Object.keys(item.qualities[0]).length).equal(4);
      expect(item.qualities[0].label).equal("Slow");
      expect(item.qualities[0].title).equal("Slow");
      expect(item.qualities[0].icon).equal("fa-weight-hanging");
      expect(item.qualities[0].image).contain("assets/slow.png");
    });
  });
  describe("autotags()", () => {
    it("Returns an flattened array with damage and autotags", () => {
      const item = new OseDataModelWeapon();
      expect(item.autoTags.length).equal(1);
      expect(Object.keys(item.autoTags[0]).length).equal(2);
      expect(item.autoTags[0].icon).equal("fa-tint");
      expect(item.autoTags[0].label).equal("");
    });
    it("Damage is present in flattened array", () => {
      const item = new OseDataModelWeapon();
      item.damage = "1d13";
      expect(item.autoTags.length).equal(1);
      expect(Object.keys(item.autoTags[0]).length).equal(2);
      expect(item.autoTags[0].icon).equal("fa-tint");
      expect(item.autoTags[0].label).equal("1d13");
    });
    it("A melee tag is returned as expected", () => {
      const item = new OseDataModelWeapon();
      item.melee = true;
      expect(item.autoTags.length).equal(2);
      expect(Object.keys(item.autoTags[0]).length).equal(2);
      expect(item.autoTags[0].icon).equal("fa-tint");
      expect(item.autoTags[0].label).equal("");
      expect(Object.keys(item.autoTags[1]).length).equal(3);
      expect(item.autoTags[1].label).equal("Melee");
      expect(item.autoTags[1].icon).equal("fa-sword");
      expect(item.autoTags[1].image).contain("assets/melee.png");
    });
    it("A missile tag is returned as expected", () => {
      const item = new OseDataModelWeapon();
      item.missile = true;
      expect(item.autoTags.length).equal(3);
      expect(Object.keys(item.autoTags[0]).length).equal(2);
      expect(item.autoTags[0].icon).equal("fa-tint");
      expect(item.autoTags[0].label).equal("");
      expect(Object.keys(item.autoTags[1]).length).equal(3);
      expect(item.autoTags[1].label).equal("Missile");
      expect(item.autoTags[1].icon).equal("fa-bow-arrow");
      expect(item.autoTags[1].image).contain("assets/missile.png");
      expect(Object.keys(item.autoTags[2]).length).equal(2);
      expect(item.autoTags[2].label).equal("0/0/0");
      expect(item.autoTags[2].icon).equal("fa-bullseye");
    });
    it("A missile tag with ranges is returned as expected", () => {
      const item = new OseDataModelWeapon();
      item.missile = true;
      item.range.short = 30;
      item.range.medium = 60;
      item.range.long = 90;
      expect(item.autoTags.length).equal(3);
      expect(Object.keys(item.autoTags[0]).length).equal(2);
      expect(item.autoTags[0].icon).equal("fa-tint");
      expect(item.autoTags[0].label).equal("");
      expect(Object.keys(item.autoTags[1]).length).equal(3);
      expect(item.autoTags[1].label).equal("Missile");
      expect(item.autoTags[1].icon).equal("fa-bow-arrow");
      expect(item.autoTags[1].image).contain("assets/missile.png");
      expect(Object.keys(item.autoTags[2]).length).equal(2);
      expect(item.autoTags[2].label).equal("30/60/90");
      expect(item.autoTags[2].icon).equal("fa-bullseye");
    });
    it("A slow tag is returned as expected", () => {
      const item = new OseDataModelWeapon();
      item.slow = true;
      expect(item.autoTags.length).equal(2);
      expect(Object.keys(item.autoTags[0]).length).equal(2);
      expect(item.autoTags[0].icon).equal("fa-tint");
      expect(item.autoTags[0].label).equal("");
      expect(Object.keys(item.autoTags[1]).length).equal(3);
      expect(item.autoTags[1].label).equal("Slow");
      expect(item.autoTags[1].icon).equal("fa-weight-hanging");
      expect(item.autoTags[1].image).contain("assets/slow.png");
    });
    it("A save tag is returned as expected", () => {
      const item = new OseDataModelWeapon();
      item.save = "death";
      expect(item.autoTags.length).equal(2);
      expect(Object.keys(item.autoTags[0]).length).equal(2);
      expect(item.autoTags[0].icon).equal("fa-tint");
      expect(item.autoTags[0].label).equal("");
      expect(Object.keys(item.autoTags[1]).length).equal(2);
      expect(item.autoTags[1].label).equal("Death Poison"); // Localized
      expect(item.autoTags[1].icon).equal("fa-skull");
    });
  });
};
