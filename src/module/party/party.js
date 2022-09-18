export class OseParty {
  static get currentParty() {
    const systemName = game.system.id == 'ose' ?game.system.id : 'ose-dev'
    const characters = game.actors.filter(
      (act) =>
        act.data.type === "character" &&
        act.data.flags[systemName] &&
        act.data.flags[systemName].party === true);

    return characters;
  }
}