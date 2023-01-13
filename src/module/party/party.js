import {OSE} from '../config';

export class OseParty {
  /**
   * @public
   * Returns all characters currently in the Party
   * @return {OseActor[]}
   */
  static get currentParty() {
    const characters = game.actors.filter(
      (act) =>
        act.type === "character" &&
        act.flags[game.system.id] &&
        act.flags[game.system.id].party === true
    );
    return characters;
  }
}
