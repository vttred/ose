/**
 * @file Contains tests for Spell Item Data Model.
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../../e2e";
import OseDataModelSpell from "../data-model-spell";

export const key = "ose.datamodel.item.spell";
export const options = { displayName: "Item Data Model: Spell" };

export default ({ describe, it, expect }: QuenchMethods) => {
  describe("manualTags()", () => {
    const spell = new OseDataModelSpell();
    it("By default return empty array", () => {
      expect(spell.manualTags.length).equal(0);
    });

    it("Can write tags to tags field", () => {
      spell.tags = [{ title: "title", value: "value" }];
      expect(spell.tags.length).equal(1);
      expect(Object.keys(spell.tags[0]).length).equal(2);
      expect(spell.tags[0].title).equal("title");
      expect(spell.tags[0].value).equal("value");
      expect(spell.tags[0].label).is.undefined;
    });

    it("Can retrieve tags", () => {
      expect(spell.manualTags.length).equal(1);
      expect(spell.manualTags[0].title).equal("title");
      expect(spell.manualTags[0].value).equal("value");
      expect(spell.tags[0].label).is.undefined;
    });
  });

  describe("autoTags()", () => {
    const spell = new OseDataModelSpell();
    it("By default return 3 auto-tags", () => {
      expect(spell.autoTags.length).equal(3);
      spell.autoTags.forEach((t) => {
        expect(t).not.null;
        expect(t?.label).equal("");
      });
    });

    it("Save create autoTags", () => {
      spell.save = "death";
      expect(spell.autoTags.length).equal(4);
      expect(Object.keys(spell.autoTags[3]).length).equal(2);
      expect(spell.autoTags[3].label).equal(
        game.i18n.localize("OSE.saves.death.long")
      );
      expect(spell.autoTags[3].icon).equal("fa-skull");
    });

    it("Roll create autoTags", () => {
      spell.roll = "1d20+1";
      expect(spell.autoTags.length).equal(5);
      expect(Object.keys(spell.autoTags[3]).length).equal(1);
      expect(spell.autoTags[3].label).equal(
        `${game.i18n.localize("OSE.items.Roll")} 1d20+1`
      );
    });
  });
};
