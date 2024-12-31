import OseItem from "../item/entity";

import skipRollDialogCheck from "../helpers-behaviour";
import OseDice from "../helpers-dice";

/**
 * Used in the rollAttack function to remove zeroes from rollParts arrays
 *
 * @param {[]} arr - an array
 * @returns {[]} - an array
 */
const removeFalsyElements = (arr) =>
  arr.reduce((a, b) => (b ? [...a, b] : a), []);

export default class OseActor extends Actor {
  prepareDerivedData() {
    if (game.version.startsWith("10")) this.system.prepareDerivedData?.();
  }

  static migrateData(source) {
    // Fixing missing img
    if (source?.img === "") {
      source.img = "icons/svg/mystery-man.svg";
    }
    if (source?.prototypeToken?.texture?.img === "") {
      source.prototypeToken.texture.img = "icons/svg/mystery-man.svg";
    }
    // Fixing missing movement.value by moving it to details.movement
    if (source?.system?.movement?.value && !source?.system?.details.movement) {
      source.system.details.movement = source.system.movement.value;
      delete source.system.movement.value;
    }

    return source;
  }

  async update(data, options = {}) {
    const newData = { ...data };
    const {
      "system.ac.value": acValue,
      "system.aac.value": aacValue,
      "system.thac0.bba": bbaValue,
      "system.thac0.value": thac0Value,
    } = newData;
    // Compute AAC from AC
    if (acValue !== undefined) {
      newData["system.aac.value"] = 19 - acValue;
    } else if (aacValue !== undefined) {
      newData["system.ac.value"] = 19 - aacValue;
    }

    // Compute Thac0 from BBA
    if (thac0Value !== undefined) {
      newData["system.thac0.bba"] = 19 - thac0Value;
    } else if (bbaValue !== undefined) {
      newData["system.thac0.value"] = 19 - bbaValue;
    }

    super.update(newData, options);
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
    hd = hd.includes("+") ? parseInt(hd) + 1 : parseInt(hd);

    // Compute saves
    let saves = {};
    for (let i = 0; i <= hd; i++) {
      const tmp = CONFIG.OSE.monster_saves[i];
      if (tmp) {
        saves = tmp;
      }
    }

    // Compute Thac0
    let thac0 = 20;
    Object.keys(CONFIG.OSE.monster_thac0).forEach((k) => {
      if (hd < parseInt(k)) return;
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
    const { total } = await new Roll(this.system.hp.hd).roll({ async: true });
    return this.update({ "system.hp": { max: total, value: total } });
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
      data,
      skipDialog: options.fastForward || skipRollDialogCheck(options.event),
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
      data,
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
      data,
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
      data,
      skipDialog: options.fastForward || skipRollDialogCheck(options.event),
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
      data,
      skipDialog: options.fastForward || skipRollDialogCheck(options.event),
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
    
    if (actorType === "character") {
      rollParts.push(actorData.scores.con.mod * actorData.details.level);
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
      data,
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
    if (options.check === "wilderness") {
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
      data,
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
      data,
      skipDialog: options.fastForward || skipRollDialogCheck(options.event),
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

    const dmgParts = [];
    if (attData.roll.dmg) {
      dmgParts.push(attData.roll.dmg);
    } else {
      dmgParts.push("1d6");
    }

    // Add Str to damage
    if (attData.roll.type === "melee" && data.scores.str.mod) {
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
      for (const t of game.user.targets.values()) {
        data.roll.target = t;
        await this.rollAttack(data, {
          type,
          skipDialog: options.skipDialog,
        });
      }
    } else {
      this.rollAttack(data, { type, skipDialog: options.skipDialog });
    }
  }

  /**
   * Constructs the attack roll formula for an attack
   *
   * @param {object} attData - the attack data
   * @param {OseItem} attData.item - the item being used in the attack
   * @param {OseActor} attData.actor - this actor (at least it should be!)
   * @param {object} attData.roll - the attack roll data
   * @param {string} attData.roll.save - the save roll that may be used against the attack
   * @param {OseActor} attData.roll.target - the target of the attack
   * @param {object} options - the type of attack and whether to skip the dialog
   * @param {string} options.type - the type of attack, i.e. melee or missile
   * @param {boolean} options.skipDialog - whether to skip the dialog
   * @returns {OseDice.Roll} - the attack roll with completed rollParts and other data
   */
  rollAttack(attData, options = {}) {
    const data = this.system;

    const label = attData.item
      ? game.i18n.format("OSE.roll.attacksWith", {
        name: attData.item.name,
      })
      : game.i18n.format("OSE.roll.attacks", {
        name: this.name,
      });

    const dmgParts = removeFalsyElements([
      // Weapon damage roll value
      attData.item?.system?.damage ?? "1d6",
    ]);
    if (!this.system.config?.ignoreBonusDamage && attData.item?.system?.bonus)
      // Weapon Damage Bonus
      dmgParts.push(attData.item?.system?.bonus);

    const rollParts = ["1d20"];
    const ascending = game.settings.get(game.system.id, "ascendingAC");

    if (ascending && data.thac0.bba) rollParts.push(data.thac0.bba);

    // for each type of attack, add the Tweaks bonus
    // and str/dex modifier only if it's non-zero
    let attackMods = [];

    if (options.type === "melee")
      attackMods = [data.scores.str.mod, data.thac0.mod.melee];

    dmgParts.push(...removeFalsyElements(attackMods));

    // Add missile mod to attack roll only (missile attacks don't get bonus damage)
    if (options.type === "missile")
      attackMods = [data.scores.dex.mod, data.thac0.mod.missile];

    // Add weapon bonus to attack roll only (already added to dmgParts)
    if (attData.item) attackMods.push(attData.item?.system?.bonus);

    rollParts.push(...removeFalsyElements(attackMods));

    const rollData = {
      actor: this,
      item: attData.item,
      itemId: attData.item?._id,
      roll: {
        type: options.type,
        thac0: data.thac0.value,
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
      "system.hp.value": Math.clamp(value - amount, 0, max),
    });
  }
}
