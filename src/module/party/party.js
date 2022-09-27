export class OseParty {
  /**
   * @public
   * Returns all characters currently in the Party
   * @return {OseActor[]}
   */
  static get currentParty() {
    const v10 = isNewerVersion(game.version, "10.264");
    const systemName = game.system.id == 'ose' ? game.system.id : 'ose-dev'
    const characters = v10 ?
      game.actors.filter(
        (act) =>
          act.type === "character" &&
          act.flags[systemName] &&
          act.flags[systemName].party === true) :
      game.actors.filter(
        (act) =>
          act.data.type === "character" &&
          act.data.flags[systemName] &&
          act.data.flags[systemName].party === true);
    console.log(characters)
    return characters;
  }
}