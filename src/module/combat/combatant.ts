export class OSECombatant extends Combatant {
  static INITIATIVE_VALUE_SLOWED = -789;
  static INITIATIVE_VALUE_DEFEATED = -790;

  // ===========================================================================
  // BOOLEAN FLAGS
  // ===========================================================================

  get isCasting() {
    return this.getFlag(game.system.id, "prepareSpell");
  }
  set isCasting(value) {
    this.setFlag(game.system.id, 'prepareSpell', value)
  }
  
  get isSlow() {
    return this.actor.system.isSlow;
  }

  get isDefeated() {
    if (this.defeated)
      return true;
    
    return !this.defeated && (this.actor.system.hp.value === 0)
  }

  // ===========================================================================
  // INITIATIVE MANAGEMENT
  // ===========================================================================

  getInitiativeRoll(formula: string) {
    let term = formula || CONFIG.Combat.initiative.formula;
    if (this.isSlow) term = `${OSECombatant.INITIATIVE_VALUE_SLOWED}`;
    if (this.isDefeated) term = `${OSECombatant.INITIATIVE_VALUE_DEFEATED}`;

    return new Roll(term);
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    return foundry.utils.mergeObject(context, {
      slow: this.isSlow,
      casting: this.isCasting
    })
  }
  
}

