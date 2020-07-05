import { OseDice } from "../dice.js";

export class OseActor extends Actor {
  /**
   * Extends data from base Actor class
   */

  prepareData() {
    super.prepareData();
    const data = this.data.data;

    // Compute modifiers from actor scores
    this.computeModifiers();

    // Determine Initiative
    if (game.settings.get("ose", "individualInit")) {
      data.initiative.value = data.initiative.mod;
      if (this.data.type == "character") {
        data.initiative.value += data.scores.dex.mod;
      }
    } else {
      data.initiative.value = 0;
    }
  }
  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
    /* -------------------------------------------- */
  getExperience(value, options = {}) {
    console.log(this.data);
    if (this.data.type != 'character') {
      return;
    }
    let modified = value + (this.data.data.details.xp.bonus * value) / 100;
    console.log(modified);
    return this.update({
      "data.details.xp.value": modified + this.data.data.details.xp.value
    }).then(() => {
      const speaker = ChatMessage.getSpeaker({actor: this});
      ChatMessage.create({content: game.i18n.format("OSE.messages.getExperience", {name: this.name, value: modified}), speaker});
    });
  }
  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */
  rollSave(save, options = {}) {
    const label = game.i18n.localize(`OSE.saves.${save}.long`);
    const rollParts = ["1d20"];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "Above",
          target: this.data.data.saves[save].value,
        },
      },
    };

    let skip = options.event && options.event.ctrlKey;
  
    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} ${game.i18n.localize("OSE.SavingThrow")}`,
      title: `${label} ${game.i18n.localize("OSE.SavingThrow")}`,
    });
  }

  rollMorale(options = {}) {
    const label = game.i18n.localize(`OSE.Morale`);
    const rollParts = ["2d6"];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "Below",
          target: this.data.data.details.morale,
        },
      },
    };

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} ${game.i18n.localize("OSE.Roll")}`,
      title: `${label} ${game.i18n.localize("OSE.Roll")}`,
    });
  }

  rollCheck(score, options = {}) {
    const label = game.i18n.localize(`OSE.scores.${score}.long`);
    const rollParts = ["1d20"];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "Check",
          target: this.data.data.scores[score].value,
        },
      },
    };

    let skip = options.event && options.event.ctrlKey;

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} ${game.i18n.localize("OSE.AbilityCheck")}`,
      title: `${label} ${game.i18n.localize("OSE.AbilityCheck")}`,
    });
  }

  rollHitDice(options = {}) {
    const label = game.i18n.localize(`OSE.HitDice`);
    const rollParts = [this.data.data.hp.hd];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "Hit Dice"
        },
      },
    };

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} ${game.i18n.localize("OSE.Roll")}`,
      title: `${label} ${game.i18n.localize("OSE.Roll")}`,
    });
  }

  rollExploration(expl, options = {}) {
    const label = game.i18n.localize(`OSE.exploration.${expl}.long`);
    const rollParts = ["1d6"];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "Exploration",
          stat: expl,
        },
      },
    };

    let skip = options.event && options.event.ctrlKey;

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} ${game.i18n.localize("OSE.ExplorationCheck")}`,
      title: `${label} ${game.i18n.localize("OSE.ExplorationCheck")}`,
    });
  }

  rollDamage(attData, options = {}) {
    const data = this.data.data;

    const rollData = {
      ...this.data,
      ...{
        rollData: {
          type: "Damage",
          stat: attData.type,
          scores: data.scores
        },
      },
    };

    let dmgParts = [];
    if (!attData.dmg || !game.settings.get('ose', 'variableWeaponDamage')) {
      dmgParts.push("1d6");
    } else {
      dmgParts.push(attData.dmg);
    }

    // Add Str to damage
    if (attData.type == 'melee') {
      dmgParts.push(data.scores.str.mod);
    }

    // Damage roll
    OseDice.Roll({
      event: options.event,
      parts: dmgParts,
      data: rollData,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${attData.label} - ${game.i18n.localize("OSE.Damage")}`,
      title: `${attData.label} - ${game.i18n.localize("OSE.Damage")}`,
    })
  }

  rollAttack(attData, options = {}) {
    const rollParts = ["1d20"];
    const data = this.data.data;

    if (attData.type == "missile") {
      rollParts.push(
        data.scores.dex.mod.toString(),
        data.thac0.mod.missile.toString()
      );
    } else if (attData.type == "melee") {
      rollParts.push(
        data.scores.str.mod.toString(),
        data.thac0.mod.melee.toString()
      );
    }
    if (game.settings.get("ose", "ascendingAC")) {
      rollParts.push(this.data.data.thac0.bba.toString());
    }

    const rollData = {
      ...this.data,
      ...{
        rollData: {
          type: "Attack",
          stat: attData.type,
          scores: data.scores
        },
      },
    };
    let skip = options.event && options.event.ctrlKey;
    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: rollData,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${attData.label} - ${game.i18n.localize("OSE.Attack")}`,
      title: `${attData.label} - ${game.i18n.localize("OSE.Attack")}`,
    }).then(() => {
      this.rollDamage(attData, {});
    });
  }

  static _valueToMod(val) {
    switch (val) {
      case 3:
        return -3;
      case 4:
      case 5:
        return -2;
      case 6:
      case 7:
      case 8:
        return -1;
      case 9:
      case 10:
      case 11:
      case 12:
        return 0;
      case 13:
      case 14:
      case 15:
        return 1;
      case 16:
      case 17:
        return 2;
      case 18:
        return 3;
      default:
        return 0;
    }
  }

  static _cappedMod(val) {
    let mod = OseActor._valueToMod(val);
    if (mod > 1) {
      mod -= 1;
    } else if (mod < -1) {
      mod += 1;
    }
    return mod;
  }

  computeModifiers() {
    if (this.data.type != "character") {
      return;
    }
    const data = this.data.data;
    data.scores.str.mod = OseActor._valueToMod(this.data.data.scores.str.value);
    data.scores.int.mod = OseActor._valueToMod(this.data.data.scores.int.value);
    data.scores.dex.mod = OseActor._valueToMod(this.data.data.scores.dex.value);
    data.scores.cha.mod = OseActor._valueToMod(this.data.data.scores.cha.value);
    data.scores.wis.mod = OseActor._valueToMod(this.data.data.scores.wis.value);
    data.scores.con.mod = OseActor._valueToMod(this.data.data.scores.con.value);

    data.scores.dex.init = OseActor._cappedMod(this.data.data.scores.dex.value);
    data.scores.cha.npc = OseActor._cappedMod(this.data.data.scores.cha.value);
  }
}
