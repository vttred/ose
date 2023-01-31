/**
 * @file Contains Quench for weapons in actor sheets
 */
import { trashChat } from "../../../e2e/testUtils";

export const key = "ose.actor.crud.inventory.weapon";
export const options = {
  displayName: "Actor CRUD: Inventory, Weapon",
};

export default ({ before, after, expect, describe, it }) => {
  const testCharacterName = "Quench Test Character";

  const testActor = () => game?.actors?.getName(testCharacterName);
  const trashActor = () => testActor()?.delete();

  const prepareActor = async (data = {}) => {
    await trashChat();
    await trashActor();

    return Actor.create({
      ...data,
      name: testCharacterName,
      type: "character",
    });
  };

  /* --------------------------------------- */

  const createActorTestItem = async (type: string) =>
    // eslint-disable-next-line no-underscore-dangle
    testActor()?.sheet?._createItem(type);

  /* --------------------------------------- */

  before(async () => {
    await trashChat();
    await prepareActor();
  });

  after(async () => {
    await trashChat();
    await trashActor();
  });

  /* --------------------------------------- */

  describe("Creating", () => {
    it("Creating a weapon item on the Actor", async () => {
      const weapon: Item = await createActorTestItem("weapon");
      expect(weapon.length).equal(1);
      expect(weapon[0].name).equal("New Weapon");
    });
  });

  describe("Removing", () => {});
  describe("Updating", () => {});
  describe("Displaying", () => {});
};
