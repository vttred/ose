/**
 * @file Static OseParty methods
 */

const OseParty = {
  /**
   * Returns all characters currently in the Party
   *
   * @public
   * @returns {OseActor[]} - A list of party members
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

export default OseParty;
