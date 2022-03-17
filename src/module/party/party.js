export class OseParty {
  static get currentParty() {
    const characters = game.actors.filter(
      (act) =>
        act.data.type === "character" &&
        act.data.flags.ose &&
        act.data.flags.ose.party === true);

    return characters;
  }
}