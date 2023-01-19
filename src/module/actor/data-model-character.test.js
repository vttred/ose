import OseDataModelCharacter from "./data-model-character";

export const key = "ose.datamodel.character";
export const options = { displayName: "Character Data Model" };

export default ({
  before,
  beforeEach,
  after,
  describe,
  it,
  expect,
  ...context
}) => {
  // @todo How can we add items to this actor?
  const createMockCharacter = (system = {}, items = [], options = {}) =>
    new Actor.implementation({
      name: `Mock Character ${foundry.utils.randomID()}`,
      type: "character",
      ...options,
      system,
      items,
    });

  const createMockItem = (type, weight, quantity, options = {}) =>
    new Item.implementation({
      name: `Mock ${type} ${foundry.utils.randomID()}`,
      type,
      system: { ...options, weight, quantity: { value: quantity } },
    });

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
