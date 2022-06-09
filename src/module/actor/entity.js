import { OseDice } from "../dice";
import { OseItem } from "../item/entity";

export class OseActor extends Actor {
  /**
   * Extends data from base Actor class
   */

  prepareData() {
    super.prepareData();
    const data = this?.system || this?.data?.data; //v9-compatibility

    const actorType = this?.type || this?.data?.type; //v9-compatibility

    // Compute modifiers from actor scores
    this.computeModifiers();
    this._isSlow();
    this.computeAC();
    this.computeEncumbrance();
    this.computeTreasure();

    // Determine Initiative
    if (game.settings.get(game.system.id, "initiative") != "group") {
      data.initiative.value = data.initiative.mod;
      if (actorType === "character") {
        data.initiative.value += data.scores.dex.init;
      }
    } else {
      data.initiative.value = 0;
    }
    data.movement.encounter = Math.floor(data.movement.base / 3);
  }

  static async update(data, options = {}) {
    // Compute AAC from AC
    if (data.data?.ac?.value) {
      data.data.aac = { value: 19 - data.data.ac.value };
    } else if (data.data?.aac?.value) {
      data.data.ac = { value: 19 - data.data.aac.value };
    }

    // Compute Thac0 from BBA
    if (data.data?.thac0?.value) {
      data.data.thac0.bba = 19 - data.data.thac0.value;
    } else if (data.data?.thac0?.bba) {
      data.data.thac0.value = 19 - data.data.thac0.bba;
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
    const actorData = this?.system || this?.data?.data; //v9-compatibility
    const actorType = this?.type || this?.data?.type; //v9-compatibility
    const xpKey = isNewerVersion(game.version, "10.264")
      ? "system.details.xp.value"
      : "data.details.xp.value"; //v9-compatibility

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
    const data = this?.system || this?.data?.data; //v9-compatibility

    const actorType = this?.type || this?.data?.type; //v9-compatibility
    if (actorType == "character") {
      let ct = 0;
      Object.values(data.scores).forEach((el) => {
        ct += el.value;
      });
      return ct == 0 ? true : false;
    } else if (actorType == "monster") {
      let ct = 0;
      Object.values(data.saves).forEach((el) => {
        ct += el.value;
      });
      return ct == 0 ? true : false;
    }
  }

  generateSave(hd) {
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
      if (parseInt(hd) < parseInt(k)) {
        return;
      }
      thac0 = CONFIG.OSE.monster_thac0[k];
    });
    this.update({
      "data.thac0.value": thac0,
      "data.saves": {
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

  rollHP(options = {}) {
    const actorData = this?.system || this?.data?.data; //v9-compatibility
    let roll = new Roll(actorData.hp.hd).roll({ async: false });
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
    const actorData = this?.system || this?.data?.data; //v9-compatibility
    const actorType = this?.type || this?.data?.type; //v9-compatibility

    const data = {
      actor: isNewerVersion(game.version, "10.264") ? this : this.data, //v9-compatibility
      roll: {
        type: "above",
        target: actorData.saves[save].value,
        magic: actorType === "character" ? actorData.scores.wis.mod : 0,
      },
      details: game.i18n.format("OSE.roll.details.save", { save: label }),
    };

    let skip = options?.event?.ctrlKey || options.fastForward;

    const rollMethod =
      actorType === "character" ? OseDice.RollSave : OseDice.Roll;

    // Roll and return
    return rollMethod({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("OSE.roll.save", { save: label }),
      title: game.i18n.format("OSE.roll.save", { save: label }),
      chatMessage: options.chatMessage,
    });
  }

  rollMorale(options = {}) {
    const actorData = this?.system || this?.data?.data; //v9-compatibility

    const rollParts = ["2d6"];

    const data = {
      actor: isNewerVersion(game.version, "10.264") ? this : this.data, //v9-compatibility
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

    const actorData = this?.system || this?.data?.data; //v9-compatibility

    const data = {
      actor: isNewerVersion(game.version, "10.264") ? this : this.data, //v9-compatibility
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
      actor: isNewerVersion(game.version, "10.264") ? this : this.data, //v9-compatibility
      roll: {
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
    };

    let skip =
      options.event && (options.event.ctrlKey || options.event.metaKey);

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
    const actorType = this?.type || this?.data?.type; //v9-compatibility

    if (actorType !== "character") return;

    const actorData = this?.system || this?.data?.data; //v9-compatibility

    const label = game.i18n.localize(`OSE.scores.${score}.long`);
    const rollParts = ["1d20"];

    const data = {
      actor: isNewerVersion(game.version, "10.264") ? this : this.data, //v9-compatibility
      roll: {
        type: "check",
        target: actorData.scores[score].value,
      },

      details: game.i18n.format("OSE.roll.details.attribute", {
        score: label,
      }),
    };

    let skip = options?.event?.ctrlKey || options.fastForward;

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("OSE.roll.attribute", { attribute: label }),
      title: game.i18n.format("OSE.roll.attribute", { attribute: label }),
      chatMessage: options.chatMessage,
    });
  }

  rollHitDice(options = {}) {
    const actorType = this?.type || this?.data?.type; //v9-compatibility

    const actorData = this?.system || this?.data?.data; //v9-compatibility

    const label = game.i18n.localize(`OSE.roll.hd`);
    const rollParts = [actorData.hp.hd];
    if (actorType == "character") {
      rollParts.push(actorData.scores.con.mod);
    }

    const data = {
      actor: isNewerVersion(game.version, "10.264") ? this : this.data, //v9-compatibility
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
    const actorType = this?.type || this?.data?.type; //v9-compatibility
    if (actorType !== "monster") return;

    const actorData = this?.system || this?.data?.data; //v9-compatibility

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
      actor: isNewerVersion(game.version, "10.264") ? this : this.data, //v9-compatibility
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
    const actorType = this?.type || this?.data?.type; //v9-compatibility
    if (actorType !== "character") return;
    const actorData = this?.system || this?.data?.data; //v9-compatibility

    const label = game.i18n.localize(`OSE.exploration.${expl}.long`);
    const rollParts = ["1d6"];

    const data = {
      actor: isNewerVersion(game.version, "10.264") ? this : this.data, //v9-compatibility
      roll: {
        type: "below",
        target: actorData.exploration[expl],
        blindroll: true,
      },
      details: game.i18n.format("OSE.roll.details.exploration", {
        expl: label,
      }),
    };

    let skip =
      options.event && (options.event.ctrlKey || options.event.metaKey);

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("OSE.roll.exploration", { exploration: label }),
      title: game.i18n.format("OSE.roll.exploration", { exploration: label }),
    });
  }

  rollDamage(attData, options = {}) {
    const data = this?.system || this?.data?.data; //v9-compatibility

    const rollData = {
      actor: isNewerVersion(game.version, "10.264") ? this : this.data, //v9-compatibility
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
    const data = this?.system || this?.data?.data; //v9-compatibility

    const rollParts = ["1d20"];
    const dmgParts = [];
    let label = game.i18n.format("OSE.roll.attacks", {
      name: this.data.name,
    });
    if (!attData.item) {
      dmgParts.push("1d6");
    } else {
      label = game.i18n.format("OSE.roll.attacksWith", {
        name: attData.item.name,
      });
      dmgParts.push(attData.item.data.damage);
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
    if (attData.item && attData.item.data.bonus) {
      rollParts.push(attData.item.data.bonus);
    }
    let thac0 = data.thac0.value;
    if (options.type == "melee") {
      dmgParts.push(data.scores.str.mod);
    }
    const rollData = {
      actor: isNewerVersion(game.version, "10.264") ? this : this.data, //v9-compatibility
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

  async applyDamage(amount = 0, multiplier = 1) {
    const actorData = this?.system || this?.data?.data; //v9-compatibility

    amount = Math.floor(parseInt(amount) * multiplier);
    const hp = actorData.hp;

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
      if (table[i] != undefined) {
        output = table[i];
      }
    }
    return output;
  }

  _isSlow() {
    const actorData = this?.system || this?.data?.data; //v9-compatibility

    const actorItems = this?.items || this?.data?.items; //v9-compatibility

    actorData.isSlow = ![...actorItems.values()].every((item) => {
      if (
        item.type !== "weapon" ||
        !item.data.data.slow ||
        !item.data.data.equipped
      ) {
        return true;
      }
      return false;
    });
  }

  computeEncumbrance() {
    const actorType = this?.type || this?.data?.type; //v9-compatibility

    const actorData = this?.system || this?.data?.data; //v9-compatibility

    const actorItems = this?.items || this?.data?.items; //v9-compatibility

    if (actorType != "character") {
      return;
    }

    const option = game.settings.get(game.system.id, "encumbranceOption");
    const items = [...actorItems.values()];
    // Compute encumbrance
    const hasAdventuringGear = items.some((item) => {
      const itemData = item?.system || item?.data?.data; //v9-compatiblity
      return item.type === "item" && !itemData.treasure;
    });

    let totalWeight = items.reduce((acc, item) => {
      const itemData = item?.system || item?.data?.data; //v9-compatiblity
      if (
        item.type === "item" &&
        (["complete", "disabled"].includes(option) || itemData.treasure)
      ) {
        return acc + itemData.quantity.value * itemData.weight;
      }
      if (
        ["weapon", "armor", "container"].includes(item.type) &&
        option !== "basic"
      ) {
        return acc + itemData.weight;
      }
      return acc;
    }, 0);

    if (option === "detailed" && hasAdventuringGear) totalWeight += 80;

    // Compute weigth thresholds
    const max = actorData.encumbrance.max;
    const basicSignificantEncumbrance = game.settings.get(
      game.system.id,
      "significantTreasure"
    );

    const steps = ["detailed", "complete"].includes(option)
      ? [400, 600, 800]
      : option === "basic"
      ? [basicSignificantEncumbrance]
      : [];

    const percentSteps = steps.map((s) => (100 * s) / max);

    actorData.encumbrance = {
      pct: Math.clamped((100 * parseFloat(totalWeight)) / max, 0, 100),
      max: max,
      encumbered: totalWeight > actorData.encumbrance.max,
      value: totalWeight,
      steps: percentSteps,
    };

    if (actorData.config.movementAuto && option != "disabled") {
      this._calculateMovement();
    }
  }

  _calculateMovement() {
    const actorData = this?.system || this?.data?.data; //v9-compatibility

    const actorItems = this?.items || this?.data?.items; //v9-compatibility

    const option = game.settings.get(game.system.id, "encumbranceOption");
    const weight = actorData.encumbrance.value;
    const delta = actorData.encumbrance.max - 1600;
    if (["detailed", "complete"].includes(option)) {
      if (weight >= actorData.encumbrance.max) {
        actorData.movement.base = 0;
      } else if (weight > 800 + delta) {
        actorData.movement.base = 30;
      } else if (weight > 600 + delta) {
        actorData.movement.base = 60;
      } else if (weight > 400 + delta) {
        actorData.movement.base = 90;
      } else {
        actorData.movement.base = 120;
      }
    } else if (option === "basic") {
      const armors = actorItems.filter((i) => i.type === "armor");
      let heaviest = 0;
      armors.forEach((a) => {
        const armorData = a?.system || a?.data?.data; //v9-compatibility
        const weight = armorData.type;
        const equipped = armorData.equipped;
        if (equipped) {
          if (weight === "light" && heaviest === 0) {
            heaviest = 1;
          } else if (weight === "heavy") {
            heaviest = 2;
          }
        }
      });
      switch (heaviest) {
        case 0:
          actorData.movement.base = 120;
          break;
        case 1:
          actorData.movement.base = 90;
          break;
        case 2:
          actorData.movement.base = 60;
          break;
      }
      if (weight >= actorData.encumbrance.max) {
        actorData.movement.base = 0;
      } else if (
        weight >= game.settings.get(game.system.id, "significantTreasure")
      ) {
        actorData.movement.base -= 30;
      }
    }
  }

  computeTreasure() {
    const actorType = this?.type || this?.data?.type; //v9-compatibility

    if (actorType != "character") {
      return;
    }

    const actorData = this?.system || this?.data?.data; //v9-compatibility
    const actorItems = this?.items || this?.data?.items; //v9-compatibility

    // Compute treasure
    let total = 0;
    let treasure = actorItems.filter((i) => {
      const itemData = i?.system || i?.data.data; //v9-compatibility
      i.type == "item" && itemData.treasure;
    });
    treasure.forEach((item) => {
      total += item.data.data.quantity.value * item.data.data.cost;
    });
    actorData.treasure = Math.round(total * 100) / 100.0;
  }

  computeAC() {
    const actorType = this?.type || this?.data?.type; //v9-compatibility

    if (actorType != "character") {
      return;
    }
    const actorData = this?.system || this?.data?.data; //v9-compatibility
    const actorItems = this?.items || this?.data?.data; //v9-compatibility

    // Compute AC
    let baseAc = 9;
    let baseAac = 10;
    let AcShield = 0;
    let AacShield = 0;

    actorData.aac.naked = baseAac + actorData.scores.dex.mod;
    actorData.ac.naked = baseAc - actorData.scores.dex.mod;
    const armors = actorItems.filter((i) => i.type == "armor");
    armors.forEach((a) => {
      const armorData = a?.system || a?.data?.data; //v9-compatibility
      if (!armorData.equipped) return;
      if (armorData.type == "shield") {
        AcShield = armorData.ac.value;
        AacShield = armorData.aac.value;
        return;
      }
      baseAc = armorData.ac.value;
      baseAac = armorData.aac.value;
    });
    actorData.aac.value =
      baseAac + actorData.scores.dex.mod + AacShield + actorData.aac.mod;
    actorData.ac.value =
      baseAc - actorData.scores.dex.mod - AcShield - actorData.ac.mod;
    actorData.ac.shield = AcShield;
    actorData.aac.shield = AacShield;
  }

  computeModifiers() {
    const actorData = this?.system || this?.data?.data; //v9-compatibility
    const actorType = this?.type || this?.data?.type;

    if (actorType != "character") {
      return;
    }

    const standard = {
      0: -3,
      3: -3,
      4: -2,
      6: -1,
      9: 0,
      13: 1,
      16: 2,
      18: 3,
    };
    actorData.scores.str.mod = OseActor._valueFromTable(
      standard,
      actorData.scores.str.value
    );
    actorData.scores.int.mod = OseActor._valueFromTable(
      standard,
      actorData.scores.int.value
    );
    actorData.scores.dex.mod = OseActor._valueFromTable(
      standard,
      actorData.scores.dex.value
    );
    actorData.scores.cha.mod = OseActor._valueFromTable(
      standard,
      actorData.scores.cha.value
    );
    actorData.scores.wis.mod = OseActor._valueFromTable(
      standard,
      actorData.scores.wis.value
    );
    actorData.scores.con.mod = OseActor._valueFromTable(
      standard,
      actorData.scores.con.value
    );

    const capped = {
      0: -2,
      3: -2,
      4: -1,
      6: -1,
      9: 0,
      13: 1,
      16: 1,
      18: 2,
    };
    actorData.scores.dex.init = OseActor._valueFromTable(
      capped,
      actorData.scores.dex.value
    );
    actorData.scores.cha.npc = OseActor._valueFromTable(
      capped,
      actorData.scores.cha.value
    );
    actorData.scores.cha.retain = actorData.scores.cha.mod + 4;
    actorData.scores.cha.loyalty = actorData.scores.cha.mod + 7;

    const od = {
      0: 0,
      3: 1,
      9: 2,
      13: 3,
      16: 4,
      18: 5,
    };
    actorData.exploration.odMod = OseActor._valueFromTable(
      od,
      actorData.scores.str.value
    );

    const literacy = {
      0: "",
      3: "OSE.Illiterate",
      6: "OSE.LiteracyBasic",
      9: "OSE.Literate",
    };
    actorData.languages.literacy = OseActor._valueFromTable(
      literacy,
      actorData.scores.int.value
    );

    const spoken = {
      0: "OSE.NativeBroken",
      3: "OSE.Native",
      13: "OSE.NativePlus1",
      16: "OSE.NativePlus2",
      18: "OSE.NativePlus3",
    };
    actorData.languages.spoken = OseActor._valueFromTable(
      spoken,
      actorData.scores.int.value
    );
  }
}
