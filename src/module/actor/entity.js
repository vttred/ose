export class OseActor extends Actor {
  /**
   * Extends data from base Actor class
   */
  prepareData() {
    super.prepareData();
    return this.data;
  }
  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
    /* -------------------------------------------- */

  /** @override */
  async createOwnedItem(itemData, options) {
    return super.createOwnedItem(itemData, options);
  }
  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */
  
  rollAttribute(attributeId, options = {}) {
    const label = CONFIG.MAJI.attributes[attributeId];

    const abl = this.data.data.attributes[attributeId];
    let parts = [];
    if (abl.value <= 4) {
      parts.push("2d4");
    } else if (abl.value <= 7) {
      parts.push("2d6");
    } else {
      parts.push("2d8");
    }
    let rollMode = game.settings.get("core", "rollMode");
    let roll = new Roll(parts.join(" + "), {}).roll();
    roll.toMessage(
      {
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${label} Attribute Test`,
      },
      { rollMode }
    );
    return roll;
  }

  rollInit(monsterId, options = {}) {
    let monster = game.actors.get(monsterId);
    let speed = monster.data.data.attributes.speed.value + monster.data.data.attributes.speed.mod;
    if (!game.combats.active) return;
    let combatant = game.combats.active.getCombatant(this.actor);
    console.log(combatant);
  }

  static async applyDamage(roll, options = {}) {
    let value = Math.floor(parseFloat(roll.find(".dice-total").text()));
    const promises = [];
    for (let t of canvas.tokens.controlled) {
      let a = t.actor,
        hp = a.data.data.hp;
      let delta = 0;
      if (a.data.type == "monster") {
        if (options.vulnerable) {
          delta -= value + a.data.data.affinity.value;
        } else if (options.resistant) {
          delta -= Math.max(0, value - a.data.data.resistance.value);
        } else if (options.healing) {
          delta += value;
        } else {
          delta -= value;
        }
      } else {
        delta -= options.healing ? -value : value;
      }
      promises.push(
        t.actor.update({
          "data.hp.value": Math.clamped(hp.value + delta, 0, hp.max),
        })
      );
    }
    return Promise.all(promises);
  }
}
