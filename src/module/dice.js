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
    };

    // Optionally include a situational bonus
    if (form !== null && form.bonus.value) {
      parts.push(form.bonus.value);
    }

    // ;
    const roll = new Roll(parts.join("+"), data).evaluate({ async: false });

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

  digestResult(data, roll) {
    const result = {
      isSuccess: false,
      isFailure: false,
      target: data.roll.target,
      total: roll.total,
    };

    const die = roll.terms[0].total;
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
      // No default
    }
    return result;
  },

  attackIsSuccess(roll, thac0, ac) {
    if (roll.total === 1 || roll.terms[0].results[0] === 1) {
      return false;
    }
    if (roll.total >= 20 || roll.terms[0].results[0] === 20) {
      return true, -3;
    }
    if (roll.total + ac >= thac0) {
      return true;
    }
    return false;
  },

  digestAttackResult(data, roll) {
    const result = {
      isSuccess: false,
      isFailure: false,
      target: "",
      total: roll.total,
    };
    result.target = data.roll.thac0;
    const targetActorData = data.roll.target?.actor?.system || null;

    const targetAc = data.roll.target ? targetActorData.ac.value : 9;
    const targetAac = data.roll.target ? targetActorData.aac.value : 10;
    result.victim = data.roll.target ? data.roll.target.name : null;

    if (game.settings.get(game.system.id, "ascendingAC")) {
      if (
        (roll.terms[0] != 20 && roll.total < targetAac) ||
        roll.terms[0] === 1
      ) {
        result.details = game.i18n.format(
          "OSE.messages.AttackAscendingFailure",
          {
            bonus: result.target,
          }
        );
        return result;
      }
      result.details = game.i18n.format("OSE.messages.AttackAscendingSuccess", {
        result: roll.total,
      });
      result.isSuccess = true;
    } else {
      if (!this.attackIsSuccess(roll, result.target, targetAc)) {
        result.details = game.i18n.format("OSE.messages.AttackFailure", {
          bonus: result.target,
        });
        return result;
      }
      result.isSuccess = true;
      const value = Math.clamped(result.target - roll.total, -3, 9);
      result.details = game.i18n.format("OSE.messages.AttackSuccess", {
        result: value,
        bonus: result.target,
      });
    }
    return result;
  },

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

    const roll = new Roll(parts.join("+"), data).evaluate({ async: false });
    const dmgRoll = new Roll(data.roll.dmg.join("+"), data).evaluate({
      async: false,
    });

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
          rollData.title += ` ${game.i18n.localize("OSE.saves.magic.short")} (${
            rollData.data.roll.magic
          })`;
          roll = OseDice.sendRoll(rollData);
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("OSE.Cancel"),
        callback: (html) => {},
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
        callback: (html) => {},
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
