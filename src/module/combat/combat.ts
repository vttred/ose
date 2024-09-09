/**
 * @file System-level odifications to the way combat works
 */

/**
 * An extension of Foundry's Combat class that implements initiative for indivitual combatants.
 *
 * @todo Use a single chat card for rolling group initiative
 */
export class OSECombat extends Combat {
  static FORMULA = "1d6 + @init";

  get #rerollBehavior() {
    return game.settings.get(game.system.id, "rerollInitiative");
  }
  
  // ===========================================================================
  // INITIATIVE MANAGEMENT
  // ===========================================================================

  async #rollAbsolutelyEveryone() {
    await this.rollInitiative(
      this.combatants.map(c => c.id),
      { formula: (this.constructor as typeof OSECombat).FORMULA }
    );
  }
  
  // ===========================================================================
  // COMBAT LIFECYCLE MANAGEMENT
  // ===========================================================================

  async startCombat() {
    await super.startCombat();
    if (this.#rerollBehavior !== "reset")
      await this.#rollAbsolutelyEveryone();
    return this;
  }
  
  async _onEndRound() {
    switch(this.#rerollBehavior) {
      case "reset":
        this.resetAll();
        break;
      case "reroll":
        this.#rollAbsolutelyEveryone();
        break;
      case "keep":
      default:
        break;
    }
    // @ts-expect-error - This method exists, but the types package doesn't have it
    await super._onEndRound();
    await this.activateCombatant(0)
  }
  
  async activateCombatant(turn: number) {
    if (game.user.isGM) {
      await game.combat.update({ turn });
    }
  }
}

