/**
 * @file Quench unit tests for the Character data model class.
 */
export const key = "ose.datamodel.character";
export const options = { displayName: "Character Data Model" };

// @todo How can we add items to this actor?
const createMockCharacter = (system = {}, items = [], characterOptions = {}) =>
  // eslint-disable-next-line new-cap
  new Actor.implementation({
    name: `Mock Character ${foundry.utils.randomID()}`,
    type: "character",
    ...characterOptions,
    system,
    items,
  });

export default ({ describe, it, expect }) => {
  describe("Is this character new?", () => {
    it("New when all ability scores are at 0", () => {
      const testActor = createMockCharacter({
        scores: {
          str: { value: 0 },
          int: { value: 0 },
          wis: { value: 0 },
          dex: { value: 0 },
          con: { value: 0 },
          cha: { value: 0 },
        },
      });
      expect(testActor.system.isNew).to.be.true; // eslint-disable-line @typescript-eslint/no-unused-expressions
    });
    it("Not new when any ability score is above 0", () => {
      const testActor = createMockCharacter({
        scores: {
          str: { value: 10 },
          int: { value: 0 },
          wis: { value: 0 },
          dex: { value: 0 },
          con: { value: 0 },
          cha: { value: 0 },
        },
      });
      expect(testActor.system.isNew).to.be.false; // eslint-disable-line @typescript-eslint/no-unused-expressions
    });
  });
};
