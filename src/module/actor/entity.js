import { skipRollDialogCheck } from "../behaviourHelpers";
import { OseDice } from "../dice";
import { OseItem } from "../item/entity";

export class OseActor extends Actor {
  prepareDerivedData() {
    this.system.prepareDerivedData?.();
  }

  static async update(data, options = {}) {
    // Compute AAC from AC
    if (data?.ac?.value) {
      data.aac = { value: 19 - data.ac.value };
    } else if (data?.aac?.value) {
      data.ac = { value: 19 - data.aac.value };
    }

    // Compute Thac0 from BBA
    if (data?.thac0?.value) {
      data.thac0.bba = 19 - data.thac0.value;
    } else if (data?.thac0?.bba) {
      data.thac0.value = 19 - data.thac0.bba;
    }

    super.update(data, options);
  }

  async createEmbeddedDocuments(embeddedName, data = [], context = {}) {
    data.map((item) => {
      if (item.img === undefined) {
        item.img = OseItem.defaultIcons[item.type];
      }
    });
    return super.createEmbeddedDocuments(embeddedName, data, context);
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
    /* -------------------------------------------- */
  getExperience(value, options = {}) {
    const actorData = this.system;
    const actorType = this.type;
    // @TODO this seems like not the best spot for defining the xpKey const
    const xpKey = "system.details.xp.value";

    if (actorType !== "character") {
      return;
    }
    const modified = Math.floor(
      value + (actorData.details.xp.bonus * value) / 100
    );
    return this.update({
      [xpKey]: modified + actorData.details.xp.value,
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

  isNew() {
    return this.system.isNew;
  }

  generateSave(hd) {
    hd = (!hd.includes('+')) ? parseInt(hd) : parseInt(hd) + 1;
    
    // Compute saves
    let saves = {};
    for (let i = 0; i <= hd; i++) {
      let tmp = CONFIG.OSE.monster_saves[i];
      if (tmp) {
        saves = tmp;
      }
    }
    
    // Compute Thac0
    let thac0 = 20;
    Object.keys(CONFIG.OSE.monster_thac0).forEach((k) => {
      if (hd < parseInt(k))
        return;
      thac0 = CONFIG.OSE.monster_thac0[k];
    });
    
    this.update({
      "system.thac0.value": thac0,
      "system.thac0.bba": 19 - thac0,
      "system.saves": {
        death: {
          value: saves.d,
        },
        wand: {
          value: saves.w,
        },
        paralysis: {
          value: saves.p,
        },
        breath: {
          value: saves.b,
        },
        spell: {
          value: saves.s,
        },
      },
    });
  }

  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */

  async rollHP(options = {}) {
    let {total} = await new Roll(this.system.hp.hd).roll({ async: true });
    return this.update({ 'system.hp': {max: total, value: total}});
  }

  rollSave(save, options = {}) {
    const label = game.i18n.localize(`OSE.saves.${save}.long`);
    const rollParts = ["1d20"];
    const actorData = this.system;
    const actorType = this.type;

    const data = {
      actor: this,
      roll: {
        type: "above",
        target: actorData.saves[save].value,
        magic: actorType === "character" ? actorData.scores.wis.mod : 0,
      },
      details: game.i18n.format("OSE.roll.details.save", { save: label }),
    };

    const rollMethod =
      actorType === "character" ? OseDice.RollSave : OseDice.Roll;

    // Roll and return
    return rollMethod({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: (options.fastForward || skipRollDialogCheck(options.event)),
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("OSE.roll.save", { save: label }),
      title: game.i18n.format("OSE.roll.save", { save: label }),
      chatMessage: options.chatMessage,
    });
  }

  rollMorale(options = {}) {
    const actorData = this.system;

    const rollParts = ["2d6"];

    const data = {
      actor: this,
      roll: {
        type: "below",
        target: actorData.details.morale,
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

    const actorData = this.system;

    const data = {
      actor: this,
      roll: {
        type: "below",
        target: actorData.retainer.loyalty,
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
    const rollParts = ["2d6"];

    const data = {
      actor: this,
      roll: {
        type: "table",
        table: {
          2: game.i18n.format("OSE.reaction.Hostile", {
            name: this.name,
          }),
          3: game.i18n.format("OSE.reaction.Unfriendly", {
            name: this.name,
          }),
          6: game.i18n.format("OSE.reaction.Neutral", {
            name: this.name,
          }),
          9: game.i18n.format("OSE.reaction.Indifferent", {
            name: this.name,
          }),
          12: game.i18n.format("OSE.reaction.Friendly", {
            name: this.name,
          }),
        },
      },
    };

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: (options.fastForward || skipRollDialogCheck(options.event)),
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.localize("OSE.reaction.check"),
      title: game.i18n.localize("OSE.reaction.check"),
    });
  }

  rollCheck(score, options = {}) {
    const actorType = this.type;

    if (actorType !== "character") return;

    const actorData = this.system;

    const label = game.i18n.localize(`OSE.scores.${score}.long`);
    const rollParts = ["1d20"];

    const data = {
      actor: this,
      roll: {
        type: "check",
        target: actorData.scores[score].value,
      },

      details: game.i18n.format("OSE.roll.details.attribute", {
        score: label,
      }),
    };

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: (options.fastForward || skipRollDialogCheck(options.event)),
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("OSE.roll.attribute", { attribute: label }),
      title: game.i18n.format("OSE.roll.attribute", { attribute: label }),
      chatMessage: options.chatMessage,
    });
  }

  rollHitDice(options = {}) {
    const actorType = this.type;

    const actorData = this.system;

    const label = game.i18n.localize(`OSE.roll.hd`);
    const rollParts = [actorData.hp.hd];
    if (actorType == "character") {
      rollParts.push(actorData.scores.con.mod*actorData.details.level);
    }

    const data = {
      actor: this,
      roll: {
        type: "hitdice",
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
    const actorType = this.type;
    if (actorType !== "monster") return;

    const actorData = this.system;

    const rollParts = [];
    let label = "";
    if (options.check == "wilderness") {
      rollParts.push(actorData.details.appearing.w);
      label = "(2)";
    } else {
      rollParts.push(actorData.details.appearing.d);
      label = "(1)";
    }
    const data = {
      actor: this,
      roll: {
        type: {
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
      flavor: game.i18n.format("OSE.roll.appearing", { type: label }),
      title: game.i18n.format("OSE.roll.appearing", { type: label }),
    });
  }

  rollExploration(expl, options = {}) {
    const actorType = this.type;
    if (actorType !== "character") return;
    const actorData = this.system;

    const label = game.i18n.localize(`OSE.exploration.${expl}.long`);
    const rollParts = ["1d6"];

    const data = {
      actor: this,
      roll: {
        type: "below",
        target: actorData.exploration[expl],
        blindroll: true,
      },
      details: game.i18n.format("OSE.roll.details.exploration", {
        expl: label,
      }),
    };

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: (options.fastForward || skipRollDialogCheck(options.event)),
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("OSE.roll.exploration", { exploration: label }),
      title: game.i18n.format("OSE.roll.exploration", { exploration: label }),
    });
  }

  rollDamage(attData, options = {}) {
    const data = this.system;

    const rollData = {
      actor: this,
      item: attData.item,
      roll: {
        type: "damage",
      },
    };

    let dmgParts = [];
    if (!attData.roll.dmg) {
      dmgParts.push("1d6");
    } else {
      dmgParts.push(attData.roll.dmg);
    }

    // Add Str to damage
    if (attData.roll.type == "melee") {
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

  async targetAttack(data, type, options) {
    if (game.user.targets.size > 0) {
      for (let t of game.user.targets.values()) {
        data.roll.target = t;
        await this.rollAttack(data, {
          type: type,
          skipDialog: options.skipDialog,
        });
      }
    } else {
      this.rollAttack(data, { type: type, skipDialog: options.skipDialog });
    }
  }

  rollAttack(attData, options = {}) {
    const data = this.system;

    const rollParts = ["1d20"];
    const dmgParts = [];
    let label = game.i18n.format("OSE.roll.attacks", {
      name: this.name,
    });
    if (!attData.item) {
      dmgParts.push("1d6");
    } else {
      label = game.i18n.format("OSE.roll.attacksWith", {
        name: attData.item.name,
      });
      dmgParts.push(attData.item.system.damage);
    }

    let ascending = game.settings.get(game.system.id, "ascendingAC");
    if (ascending) {
      rollParts.push(data.thac0.bba.toString());
    }
    if (options.type == "missile") {
      rollParts.push(
        data.scores.dex.mod.toString(),
        data.thac0.mod.missile.toString()
      );
    } else if (options.type == "melee") {
      rollParts.push(
        data.scores.str.mod.toString(),
        data.thac0.mod.melee.toString()
      );
    }
    if (attData.item && attData.item.system.bonus) {
      rollParts.push(attData.item.system.bonus);
    }
    let thac0 = data.thac0.value;
    if (options.type == "melee") {
      dmgParts.push(data.scores.str.mod);
    }
    const rollData = {
      actor: this,
      item: attData.item,
      itemId: attData.item?._id,
      roll: {
        type: options.type,
        thac0: thac0,
        dmg: dmgParts,
        save: attData.roll.save,
        target: attData.roll.target,
      },
    };
    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: rollData,
      skipDialog: options.skipDialog,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: label,
      flags: { ose: { roll: "attack", itemId: attData.item?._id } },
      title: label,
    });
  }

  /**
   * @param {number | string} amount
   * @param {1 | -1} multiplier
   * @returns
   */
  async applyDamage(amount = 0, multiplier = 1) {
    amount = Math.floor(parseInt(amount) * multiplier);

    const { value, max } = this.system.hp;

    // Update the Actor
    return this.update({
      "system.hp.value": Math.clamped(value - amount, 0, max),
    });
  }
}
