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
    this._isSlow();

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
    if (this.data.type != "character") {
      return;
    }
    let modified = Math.floor(
      value + (this.data.data.details.xp.bonus * value) / 100
    );
    return this.update({
      "data.details.xp.value": modified + this.data.data.details.xp.value,
    }).then(() => {
      const speaker = ChatMessage.getSpeaker({ actor: this });
      ChatMessage.create({
        content: game.i18n.format("OSE.messages.GetExperience", {
          name: this.name,
          value: modified,
        }),
        speaker,
      });
    });
  }

  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */

  rollHP(options = {}) {
    let roll = new Roll(this.data.data.hp.hd).roll();
    return this.update({
      data: {
        hp: {
          max: roll.total,
          value: roll.total,
        },
      },
    });
  }

  rollSave(save, options = {}) {
    const label = game.i18n.localize(`OSE.saves.${save}.long`);
    const rollParts = ["1d20"];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "above",
          target: this.data.data.saves[save].value,
          details: game.i18n.format("OSE.roll.details.save", { save: label }),
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
      flavor: game.i18n.format("OSE.roll.save", { save: label }),
      title: game.i18n.format("OSE.roll.save", { save: label }),
    });
  }

  rollMorale(options = {}) {
    const rollParts = ["2d6"];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "below",
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
      flavor: game.i18n.localize("OSE.roll.morale"),
      title: game.i18n.localize("OSE.roll.morale"),
    });
  }

  rollLoyalty(options = {}) {
    const label = game.i18n.localize(`OSE.roll.loyalty`);
    const rollParts = ["2d6"];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "below",
          target: this.data.data.retainer.loyalty,
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
      flavor: label,
      title: label,
    });
  }

  rollReaction(options = {}) {
    const label = game.i18n.localize(`OSE.details.reaction`);
    const rollParts = ["2d6"];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "table",
          table: {
            2: game.i18n.format("OSE.reaction.Hostile", {
              name: this.data.name,
            }),
            3: game.i18n.format("OSE.reaction.Unfriendly", {
              name: this.data.name,
            }),
            6: game.i18n.format("OSE.reaction.Neutral", {
              name: this.data.name,
            }),
            9: game.i18n.format("OSE.reaction.Indifferent", {
              name: this.data.name,
            }),
            12: game.i18n.format("OSE.reaction.Friendly", {
              name: this.data.name,
            }),
          },
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
      flavor: game.i18n.localize("OSE.reaction.check"),
      title: game.i18n.localize("OSE.reaction.check"),
    });
  }

  rollCheck(score, options = {}) {
    const label = game.i18n.localize(`OSE.scores.${score}.long`);
    const rollParts = ["1d20"];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "check",
          target: this.data.data.scores[score].value,
          details: game.i18n.format("OSE.roll.details.attribute", {
            score: label,
          }),
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
      flavor: game.i18n.format("OSE.roll.attribute", {attribute: label}),
      title: game.i18n.format("OSE.roll.attribute", {attribute: label}),
    });
  }

  rollHitDice(options = {}) {
    const label = game.i18n.localize(`OSE.roll.hd`);
    const rollParts = [this.data.data.hp.hd];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "hit dice",
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
      flavor: label,
      title: label,
    });
  }

  rollAppearing(options = {}) {
    const rollParts = [];
    let label = "";
    if (options.check == "wilderness") {
      rollParts.push(this.data.data.details.appearing.w);
      label = "(2)";
    } else {
      rollParts.push(this.data.data.details.appearing.d);
      label = "(1)";
    }
    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "appearing",
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
      flavor: game.i18n.localize('OSE.roll.appearing'),
      title: game.i18n.localize('OSE.roll.appearing'),
    });
  }

  rollExploration(expl, options = {}) {
    const label = game.i18n.localize(`OSE.exploration.${expl}.long`);
    const rollParts = ["1d6"];

    const data = {
      ...this.data,
      ...{
        rollData: {
          type: "below",
          target: this.data.data.exploration[expl],
          details: game.i18n.format("OSE.roll.details.exploration", {
            expl: label,
          }),
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
      flavor: game.i18n.format("OSE.roll.exploration", {exploration: label}),
      title: game.i18n.format("OSE.roll.exploration", {exploration: label}),
    });
  }

  rollDamage(attData, options = {}) {
    const data = this.data.data;

    const rollData = {
      ...this.data,
      ...{
        rollData: {
          type: "damage",
          stat: attData.type,
          scores: data.scores,
        },
      },
    };

    let dmgParts = [];
    if (
      (!attData.dmg || !game.settings.get("ose", "variableWeaponDamage")) &&
      this.type == "character"
    ) {
      dmgParts.push("1d6");
    } else {
      dmgParts.push(attData.dmg);
    }

    // Add Str to damage
    if (attData.type == "melee") {
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
    });
  }

  rollAttack(attData, options = {}) {
    const data = this.data.data;
    const rollParts = ["1d20"];
    const dmgParts = [];
    let label = game.i18n.format('OSE.roll.attacks', {name: this.data.name})
    if (
      !attData.dmg ||
      (!game.settings.get("ose", "variableWeaponDamage") &&
        this.data.type == "character")
    ) {
      dmgParts.push("1d6");
    } else {
      label = game.i18n.format('OSE.roll.attacksWith', {name: attData.label})
      dmgParts.push(attData.dmg);
    }

    let ascending = game.settings.get("ose", "ascendingAC");
    if (ascending) {
      rollParts.push(data.thac0.bba.toString());
    }
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
    if (attData.bonus) {
      rollParts.push(attData.bonus);
    }
    let thac0 = data.thac0.value;
    if (attData.type == "melee") {
      dmgParts.push(data.scores.str.mod);
    }

    const rollData = {
      ...this.data,
      ...{
        rollData: {
          type: "attack",
          thac0: thac0,
          weapon: {
            parts: dmgParts,
          },
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
      flavor: label,
      title: label,
    });
  }

  async applyDamage(amount = 0, multiplier = 1) {
    amount = Math.floor(parseInt(amount) * multiplier);
    const hp = this.data.data.hp;

    // Remaining goes to health
    const dh = Math.clamped(hp.value - amount, 0, hp.max);

    // Update the Actor
    return this.update({
      "data.hp.value": dh,
    });
  }

  static _valueFromTable(table, val) {
    let output;
    for (let i = 0; i <= val; i++) {
      if (table[i]) {
        output = table[i];
      }
    }
    return output;
  }

  _isSlow() {
    this.data.data.isSlow = false;
    if (this.data.type != "character") {
      return;
    }
    this.data.items.forEach((item) => {
      if (item.type == "weapon" && item.data.slow && item.data.equipped) {
        this.data.data.isSlow = true;
        return;
      }
    });
  }

  computeModifiers() {
    if (this.data.type != "character") {
      return;
    }
    const data = this.data.data;

    const standard = {
      3: -3,
      4: -2,
      6: -1,
      9: 0,
      13: 1,
      16: 2,
      18: 3,
    };
    data.scores.str.mod = OseActor._valueFromTable(
      standard,
      data.scores.str.value
    );
    data.scores.int.mod = OseActor._valueFromTable(
      standard,
      data.scores.int.value
    );
    data.scores.dex.mod = OseActor._valueFromTable(
      standard,
      data.scores.dex.value
    );
    data.scores.cha.mod = OseActor._valueFromTable(
      standard,
      data.scores.cha.value
    );
    data.scores.wis.mod = OseActor._valueFromTable(
      standard,
      data.scores.wis.value
    );
    data.scores.con.mod = OseActor._valueFromTable(
      standard,
      data.scores.con.value
    );

    const capped = {
      3: -2,
      4: -1,
      6: -1,
      9: 0,
      13: 1,
      16: 1,
      18: 2,
    };
    data.scores.dex.init = OseActor._valueFromTable(
      capped,
      data.scores.dex.value
    );
    data.scores.cha.npc = OseActor._valueFromTable(
      capped,
      data.scores.cha.value
    );
    data.scores.cha.retain = data.scores.cha.mod + 4;
    data.scores.cha.loyalty = data.scores.cha.mod + 7;

    const od = {
      3: 1,
      9: 2,
      13: 3,
      16: 4,
      18: 5,
    };
    data.exploration.odMod = OseActor._valueFromTable(
      od,
      data.scores.str.value
    );

    const literacy = {
      3: "OSE.Illiterate",
      6: "OSE.LiteracyBasic",
      9: "OSE.Literate",
    };
    data.languages.literacy = OseActor._valueFromTable(
      literacy,
      data.scores.int.value
    );

    const spoken = {
      3: 0,
      13: 2,
      16: 3,
      18: 4,
    };
    data.languages.count = OseActor._valueFromTable(
      spoken,
      data.scores.int.value
    );
  }
}
