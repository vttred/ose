/**
 * @file Helpful methods for dealing with OSE-specific dice logic
 */
import OSE from "./config";

const OseDice = {
  async sendRoll({
    parts = [],
    data = {},
    title = null,
    flavor = null,
    speaker = null,
    form = null,
    chatMessage = true,
  } = {}) {
    const template = `${OSE.systemPath()}/templates/chat/roll-result.html`;

    const chatData = {
      user: game.user.id,
      speaker,
    };

    const templateData = {
      title,
      flavor,
      data,
      config: CONFIG.OSE,
    };

    // Optionally include a situational bonus
    if (form !== null && form.bonus.value) {
      parts.push(form.bonus.value);
    }

    const roll = new Roll(parts.join("+"), data);
    await roll.evaluate({allowStrings: true});

    // Convert the roll to a chat message and return the roll
    let rollMode = game.settings.get("core", "rollMode");
    rollMode = form ? form.rollMode.value : rollMode;

    // Force blind roll (ability formulas)
    if (!form && data.roll.blindroll) {
      rollMode = game.user.isGM ? "selfroll" : "blindroll";
    }

    if (["gmroll", "blindroll"].includes(rollMode))
      chatData.whisper = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "selfroll") chatData.whisper = [game.user._id];
    if (rollMode === "blindroll") {
      chatData.blind = true;
      data.roll.blindroll = true;
    }

    templateData.result = OseDice.digestResult(data, roll);

    return new Promise((resolve) => {
      roll.render().then((r) => {
        templateData.rollOSE = r;
        renderTemplate(template, templateData).then((content) => {
          chatData.content = content;
          // Dice So Nice
          if (game.dice3d) {
            game.dice3d
              .showForRoll(
                roll,
                game.user,
                true,
                chatData.whisper,
                chatData.blind
              )
              .then((displayed) => {
                if (chatMessage !== false) ChatMessage.create(chatData);
                resolve(roll);
              });
          } else {
            chatData.sound = CONFIG.sounds.dice;
            if (chatMessage !== false) ChatMessage.create(chatData);
            resolve(roll);
          }
        });
      });
    });
  },

  /**
   * Digesting results depending on type of roll
   *
   * @param {object} data - Contains roll data, including what type of check
   * @param {object} roll - Evaluated Roll returned object
   * @returns {object} - Object containing the evaluated data // @todo DigestResult
   */
  digestResult(data, roll) {
    // @todo: Extract this to a DigestResult type/interface
    const result = {
      isSuccess: false,
      isFailure: false,
      target: data.roll.target,
      total: roll.total,
    };

    const die = roll.terms[0].results[0].result;
    // eslint-disable-next-line default-case
    switch (data.roll.type) {
      case "result": {
        if (roll.total === result.target) {
          result.isSuccess = true;
        } else {
          result.isFailure = true;
        }

        break;
      }

      case "above": {
        // SAVING THROWS
        if (roll.total >= result.target) {
          result.isSuccess = true;
        } else {
          result.isFailure = true;
        }

        break;
      }

      case "below": {
        // MORALE, EXPLORATION
        if (roll.total <= result.target) {
          result.isSuccess = true;
        } else {
          result.isFailure = true;
        }

        break;
      }

      case "check": {
        // SCORE CHECKS (1s and 20s)
        if (die === 1 || (roll.total <= result.target && die < 20)) {
          result.isSuccess = true;
        } else {
          result.isFailure = true;
        }

        break;
      }

      case "table": {
        // Reaction
        const { table } = data.roll;
        let output = Object.values(table)[0];
        for (let i = 0; i <= roll.total; i++) {
          if (table[i]) {
            output = table[i];
          }
        }
        result.details = output;

        break;
      }

      default: {
        result.isSuccess = false;
        result.isFailure = false;

        break;
      }
    }
    return result;
  },

  /**
   * Evaluates if a roll is successful for both THAC0 and Ascending AC
   *
   * @param {object} roll - Evaluated roll data from a Roll
   * @param {number} thac0 - THAC0 value, or Hit Target when AscendingAC
   * @param {number} ac - AC Value, or Attack Bonus when AscendingAC
   * @returns {boolean} - Did the attack succeed?
   */
  attackIsSuccess(roll, thac0, ac) {
    // Natural 1
    if (roll.terms[0].results[0].result === 1) {
      return false;
    }
    // Natural 20
    if (roll.terms[0].results[0].result === 20) {
      return true;
    }
    return roll.total + ac >= thac0;
  },

  /**
   * Digest the results of a target to reach, and an evaluated roll
   * to evaluate if it does hit or not. The function adds information
   * for generating chat card data too.
   *
   * @param {object} data - Data with at least roll target data
   * @param {object} roll - Evaluation result from a Roll
   * @returns {object} - DigestResult
   */
  digestAttackResult(data, roll) {
    // @todo: Extract this to a DigestResult type/interface
    const result = {
      isSuccess: false,
      isFailure: false,
      target: "",
      total: roll.total,
    };
    result.target = data.roll.thac0;
    const targetActorData = data.roll.target?.actor?.system || null;

    const targetAc = data.roll.target ? targetActorData.ac.value : 20;
    const targetAac = data.roll.target ? targetActorData.aac.value : -20;
    result.victim = data.roll.target || null;

    if (game.settings.get(game.system.id, "ascendingAC")) {
      const attackBonus = 0;
      if (this.attackIsSuccess(roll, targetAac, attackBonus)) {
        result.details = game.i18n.format(
          "OSE.messages.AttackAscendingSuccess",
          {
            result: roll.total,
          }
        );
        result.isSuccess = true;
      } else {
        result.details = game.i18n.format(
          "OSE.messages.AttackAscendingFailure",
          {
            bonus: result.target,
          }
        );
        result.isFailure = true;
      }
    } else if (this.attackIsSuccess(roll, result.target, targetAc)) {
      // Answer is bounded betweewn AC -3 and 9 (unarmored) and is shown in chat card
      const value = Math.clamp(result.target - roll.total, -3, 9);
      result.details = game.i18n.format("OSE.messages.AttackSuccess", {
        result: value,
        bonus: result.target,
      });
      result.isSuccess = true;
    } else {
      result.details = game.i18n.format("OSE.messages.AttackFailure", {
        bonus: result.target,
      });
      result.isFailure = true;
    }
    return result;
  },

  /**
   * Puts together the information needed to roll a Roll and the
   * expectations on hitting a target. Also creates the chat card
   * containing the infromation about the evaluated roll.
   *
   * @param {object} param0 - Object to evaluate
   * @param {Array<String || number>} param0.parts - Roll parts (e.g. ["1d20", "3", "0", "0"])
   * @param {object} param0.data - Object containing target data
   * @param {object} param0.data.roll - Roll target data
   * @param {Array<String || number|} param0.data.roll.dmg - Roll parts for damage roll if hit
   * @param {Actor | null} param0.data.target - Target data for the intended hit target
   * @param {object} param0.flags -Not used directly in function, but may be passed on
   * @param {string} param0.title - Modified in RollSave() if magic save required
   * @param {string} param0.flavor - Not used directly in function
   * @param {object} param0.speaker - Speaker data for the chat card
   * @param {object} param0.form - Data from the Dialog Form that generates data for the function
   * @returns {Promise || Void} - Either not returning anything, or a Promise for rendering a Chat Card
   */
  async sendAttackRoll({
    parts = [],
    data = {},
    flags = {},
    title = null,
    flavor = null,
    speaker = null,
    form = null,
  } = {}) {
    if (data.roll.dmg.filter((v) => v !== "").length === 0) {
      /**
       * @todo should this error be localized?
       */
      ui.notifications.error(
        "Attack has no damage dice terms; be sure to set the attack's damage"
      );
      return;
    }
    const template = `${OSE.systemPath()}/templates/chat/roll-attack.html`;
    const chatData = {
      user: game.user.id,
      speaker,
      flags,
    };

    const templateData = {
      title,
      flavor,
      data,
      config: CONFIG.OSE,
    };

    // Optionally include a situational bonus
    if (form !== null && form.bonus.value) parts.push(form.bonus.value);

    const roll = new Roll(parts.join("+"), data);
    await roll.evaluate();
    const dmgRoll = new Roll(data.roll.dmg.join("+"), data);
    await dmgRoll.evaluate();

    // Convert the roll to a chat message and return the roll
    let rollMode = game.settings.get("core", "rollMode");
    rollMode = form ? form.rollMode.value : rollMode;

    // Force blind roll (ability formulas)
    if (data.roll.blindroll) {
      rollMode = game.user.isGM ? "selfroll" : "blindroll";
    }

    if (["gmroll", "blindroll"].includes(rollMode))
      chatData.whisper = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "selfroll") chatData.whisper = [game.user._id];
    if (rollMode === "blindroll") {
      chatData.blind = true;
      data.roll.blindroll = true;
    }

    templateData.result = OseDice.digestAttackResult(data, roll);

    return new Promise((resolve) => {
      roll.render().then((r) => {
        templateData.rollOSE = r;
        dmgRoll.render().then((dr) => {
          templateData.rollDamage = dr;
          renderTemplate(template, templateData).then((content) => {
            chatData.content = content;
            // 2 Step Dice So Nice
            if (game.dice3d) {
              game.dice3d
                .showForRoll(
                  roll,
                  game.user,
                  true,
                  chatData.whisper,
                  chatData.blind
                )
                .then(() => {
                  if (templateData.result.isSuccess) {
                    templateData.result.dmg = dmgRoll.total;
                    game.dice3d
                      .showForRoll(
                        dmgRoll,
                        game.user,
                        true,
                        chatData.whisper,
                        chatData.blind
                      )
                      .then(() => {
                        ChatMessage.create(chatData);
                        resolve(roll);
                      });
                  } else {
                    ChatMessage.create(chatData);
                    resolve(roll);
                  }
                });
            } else {
              chatData.sound = CONFIG.sounds.dice;
              ChatMessage.create(chatData);
              resolve(roll);
            }
          });
        });
      });
    });
  },

  async RollSave({
    parts = [],
    data = {},
    skipDialog = false,
    speaker = null,
    flavor = null,
    title = null,
    chatMessage = true,
  } = {}) {
    let rolled = false;
    const template = `${OSE.systemPath()}/templates/chat/roll-dialog.html`;
    const dialogData = {
      formula: parts.join(" "),
      data,
      rollMode: game.settings.get("core", "rollMode"),
      rollModes: CONFIG.Dice.rollModes,
    };

    const rollData = {
      parts,
      data,
      title,
      flavor,
      speaker,
      chatMessage,
    };
    if (skipDialog) {
      return OseDice.sendRoll(rollData);
    }

    const buttons = {
      ok: {
        label: game.i18n.localize("OSE.Roll"),
        icon: '<i class="fas fa-dice-d20"></i>',
        callback: (html) => {
          rolled = true;
          rollData.form = html[0].querySelector("form");
          roll = OseDice.sendRoll(rollData);
        },
      },
      magic: {
        label: game.i18n.localize("OSE.saves.magic.short"),
        icon: '<i class="fas fa-magic"></i>',
        callback: (html) => {
          rolled = true;
          rollData.form = html[0].querySelector("form");
          rollData.parts.push(`${rollData.data.roll.magic}`);
          rollData.title += ` ${game.i18n.localize("OSE.saves.magic.short")} (${rollData.data.roll.magic
            })`;
          roll = OseDice.sendRoll(rollData);
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("OSE.Cancel"),
        callback: (html) => { },
      },
    };

    const html = await renderTemplate(template, dialogData);
    let roll;

    // Create Dialog window
    return new Promise((resolve) => {
      new Dialog({
        title,
        content: html,
        buttons,
        default: "ok",
        close: () => {
          resolve(rolled ? roll : false);
        },
      }).render(true);
    });
  },

  async Roll({
    parts = [],
    data = {},
    skipDialog = false,
    speaker = null,
    flavor = null,
    title = null,
    chatMessage = true,
    flags = {},
  } = {}) {
    let rolled = false;
    const template = `${OSE.systemPath()}/templates/chat/roll-dialog.html`;
    const dialogData = {
      formula: parts.join(" "),
      data,
      rollMode: data.roll.blindroll
        ? "blindroll"
        : game.settings.get("core", "rollMode"),
      rollModes: CONFIG.Dice.rollModes,
    };
    const rollData = {
      parts,
      data,
      title,
      flavor,
      speaker,
      chatMessage,
      flags,
    };
    if (skipDialog) {
      return ["melee", "missile", "attack"].includes(data.roll.type)
        ? OseDice.sendAttackRoll(rollData)
        : OseDice.sendRoll(rollData);
    }

    const buttons = {
      ok: {
        label: game.i18n.localize("OSE.Roll"),
        icon: '<i class="fas fa-dice-d20"></i>',
        callback: (html) => {
          rolled = true;
          rollData.form = html[0].querySelector("form");
          roll = ["melee", "missile", "attack"].includes(data.roll.type)
            ? OseDice.sendAttackRoll(rollData)
            : OseDice.sendRoll(rollData);
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("OSE.Cancel"),
        callback: (html) => { },
      },
    };

    const html = await renderTemplate(template, dialogData);
    let roll;

    // Create Dialog window
    return new Promise((resolve) => {
      new Dialog({
        title,
        content: html,
        buttons,
        default: "ok",
        close: () => {
          resolve(rolled ? roll : false);
        },
      }).render(true);
    });
  },
};

export default OseDice;
