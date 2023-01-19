import { OSE } from "../config";

export const OseParty = {
  /**
   * @public
   * Returns all characters currently in the Party
   * @return {OseActor[]}
   */
  get currentParty() {
    return game.actors.filter(
      (act) =>
        act.type === "character" &&
        act.flags[game.system.id] &&
        act.flags[game.system.id].party === true
    );
  },
};
