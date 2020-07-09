export class OseDice {
  static digestResult(data, roll) {
    let result = {
      isSuccess: false,
      isFailure: false,
      target: data.rollData.target,
    };

    let die = roll.parts[0].total;
    if (data.rollData.type == "Above") {
      // SAVING THROWS
      if (roll.total >= result.target) {
        result.isSuccess = true;
      } else {
        result.isFailure = true;
      }
    } else if (data.rollData.type == "Below") {
      // MORALE, EXPLORATION
      if (roll.total <= result.target) {
        result.isSuccess = true;
      } else {
        result.isFailure = true;
      }
    } else if (data.rollData.type == "Check") {
      // SCORE CHECKS (1s and 20s)
      if (die == 1 || (roll.total <= result.target && die < 20)) {
        result.isSuccess = true;
      } else {
        result.isFailure = true;
      }
    }
    return result;
  }

  static async sendRoll({
    parts = [],
    data = {},
    title = null,
    flavor = null,
    speaker = null,
    form = null,
  } = {}) {
    const template = "systems/ose/templates/chat/roll-result.html";

    let chatData = {
      user: game.user._id,
      speaker: speaker,
    };


    let templateData = {
      title: title,
      flavor: flavor,
      data: data,
    };

    // Optionally include a situational bonus
    if (form !== null) data["bonus"] = form.bonus.value;
    if (data["bonus"]) parts.push(data["bonus"]);

    const roll = new Roll(parts.join("+"), data).roll();

    // Convert the roll to a chat message and return the roll
    let rollMode = game.settings.get("core", "rollMode");
    rollMode = form ? form.rollMode.value : rollMode;
    
    // Force blind roll (ability formulas)
    if (data.rollData.blindroll) {
      rollMode = "blindroll";
    }

    if (["gmroll", "blindroll"].includes(rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "selfroll") chatData["whisper"] = [game.user._id];
    if (rollMode === "blindroll") chatData["blind"] = true;

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
                ChatMessage.create(chatData);
                resolve();
              });
          } else {
            chatData.sound = CONFIG.sounds.dice;
            ChatMessage.create(chatData);
            resolve();
          }
        });
      });
    });
  }

  static digestAttackResult(data, roll) {
    let result = {
      isSuccess: false,
      isFailure: false,
      target: "",
    };
    result.target = data.rollData.thac0;
    if (game.settings.get("ose", "ascendingAC")) {
      result.details = game.i18n.format('OSE.messages.AttackAscendingSuccess', {result: roll.total});
      result.isSuccess = true;
    } else {
      // B/X Historic THAC0 Calculation
      if (result.target - roll.total > 9) {
        result.details = game.i18n.format('OSE.messages.AttackFailure', {bonus: result.target});
        return result;
      }
      result.isSuccess = true;
      let value = Math.clamped(result.target - roll.total, -3, 9);
      result.details = game.i18n.format('OSE.messages.AttackSuccess', {result: value, bonus: result.target});
    }
    return result;
  }

  static async sendAttackRoll({
    parts = [],
    data = {},
    title = null,
    flavor = null,
    speaker = null,
    form = null,
  } = {}) {
    const template = "systems/ose/templates/chat/roll-attack.html";

    let chatData = {
      user: game.user._id,
      speaker: speaker,
    };

    let templateData = {
      title: title,
      flavor: flavor,
      data: data,
    };

    // Optionally include a situational bonus
    if (form !== null) data["bonus"] = form.bonus.value;
    if (data["bonus"]) parts.push(data["bonus"]);

    const roll = new Roll(parts.join("+"), data).roll();
    const dmgRoll = new Roll(data.rollData.weapon.parts.join("+"), data).roll();

    // Convert the roll to a chat message and return the roll
    let rollMode = game.settings.get("core", "rollMode");
    rollMode = form ? form.rollMode.value : rollMode;
    
    if (["gmroll", "blindroll"].includes(rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "selfroll") chatData["whisper"] = [game.user._id];
    if (rollMode === "blindroll") chatData["blind"] = true;

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
                      resolve();
                    });
                  } else {
                    ChatMessage.create(chatData);
                    resolve();
                  }
                });
            } else {
              chatData.sound = CONFIG.sounds.dice;
              ChatMessage.create(chatData);
              resolve();
            }
          });
        });
      });
    });
  }

  static async Roll({
    parts = [],
    data = {},
    options = {},
    event = null,
    skipDialog = false,
    speaker = null,
    flavor = null,
    title = null,
    item = false,
  } = {}) {
    let rolled = false;

    const template = "systems/ose/templates/chat/roll-dialog.html";
    let dialogData = {
      formula: parts.join(" "),
      data: data,
      rollMode: game.settings.get('core', 'rollMode'),
      rollModes: CONFIG.Dice.rollModes,
    };

    let rollData = {
      parts: parts,
      data: data,
      title: title,
      flavor: flavor,
      speaker: speaker
    };
    if (skipDialog) {
      return data.rollData.type === "Attack"
        ? OseDice.sendAttackRoll(rollData)
        : OseDice.sendRoll(rollData);
    }

    let buttons = {
      ok: {
        label: game.i18n.localize("OSE.Roll"),
        icon: '<i class="fas fa-dice-d20"></i>',
        callback: (html) => {
          rolled = true;
          rollData.form = html[0].children[0];
          roll =
            data.rollData.type === "Attack"
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

    //Create Dialog window
    return new Promise((resolve) => {
      new Dialog({
        title: title,
        content: html,
        buttons: buttons,
        default: "ok",
        close: () => {
          resolve(rolled ? roll : false);
        },
      }).render(true);
    });
  }
}
