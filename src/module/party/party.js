export class OseParty {
  /**
   * @public
   * Returns all characters currently in the Party
   * @return {OseActor[]}
   */
  static get currentParty() {
    const systemName = game.system.id == "ose" ? game.system.id : "ose-dev";
    const characters = game.actors.filter(
      (act) =>
        act.type === "character" &&
        act.flags[systemName] &&
        act.flags[systemName].party === true
    );
    console.log(characters);
    return characters;
  }
}
