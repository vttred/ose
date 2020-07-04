export class OseDice {
  static digestResult(data, roll) {
    let details = "";
    // ATTACKS
    let die = roll.parts[0].total;
    if (data.rollData.type == "Attack") {
      if (game.settings.get("ose", "ascendingAC")) {
        let bba = data.data.thac0.bba;
        if (data.rollData.stat == "melee") {
          bba += data.data.thac0.mod.melee + data.rollData.scores.str.mod;
        } else if (data.rollData.stat == "missile") {
          bba += data.data.thac0.mod.missile + data.rollData.scores.dex.mod;
        }

        details = `<div class='roll-result roll-fail'><b>Failure</b> (${bba})</div>`;
        if (die == 1) {
          return details;
        }
        details = `<div class='roll-result'><b>Hits AC ${roll.total}</b> (${bba})</div>`;
      } else {
        // B/X Historic THAC0 Calculation
        let thac = data.data.thac0.value;
        if (data.rollData.stat == "melee") {
          thac -= data.data.thac0.mod.melee + data.rollData.scores.str.mod;
        } else if (data.rollData.stat == "missile") {
          thac -= data.data.thac0.mod.missile + data.rollData.scores.dex.mod;
        }
        details = `<div class='roll-result roll-fail'><b>Failure</b> (${thac})</div>`;
        if (thac - roll.total > 9) {
          return details;
        }
        details = `<div class='roll-result'><b>Hits AC ${Math.clamped(
          thac - roll.total,
          -3,
          9
        )}</b> (${thac})</div>`;
        // ADD DAMAGE ROLL
      }
    } else if (data.rollData.type == "Save") {
      // SAVING THROWS
      let sv = data.data.saves[data.rollData.stat].value;
      if (roll.total >= sv) {
        details = `<div class='roll-result roll-success'><b>Success!</b> (${sv})</div>`;
      } else {
        details = `<div class='roll-result roll-fail'><b>Failure</b> (${sv})</div>`;
      }
    } else if (data.rollData.type == "Check") {
      // SCORE CHECKS
      let sc = data.data.scores[data.rollData.stat].value;
      if (die == 1 || (roll.total <= sc && die < 20)) {
        details = `<div class='roll-result roll-success'><b>Success!</b> (${sc})</div>`;
      } else {
        details = `<div class='roll-result roll-fail'><b>Failure</b> (${sc})</div>`;
      }
    } else if (data.rollData.type == "Exploration") {
      // EXPLORATION CHECKS
      let sc = data.data.exploration[data.rollData.stat];
      if (roll.total <= sc) {
        details = `<div class='roll-result roll-success'><b>Success!</b> (${sc})</div>`;
      } else {
        details = `<div class='roll-result roll-fail'><b>Failure</b> (${sc})</div>`;
      }
    }
    return details;
  }

  static async sendRoll({
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

    const roll = new Roll(parts.join(""), data).roll();

    // Convert the roll to a chat message and return the roll
    let rollMode = game.settings.get("core", "rollMode");
    rollMode = form ? form.rollMode.value : rollMode;

    templateData.details = OseDice.digestResult(data, roll);

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
    let rollMode = game.settings.get("core", "rollMode");
    let rolled = false;

    const template = "systems/ose/templates/chat/roll-dialog.html";
    let dialogData = {
      formula: parts.join(" "),
      data: data,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes,
    };

    let buttons = {
      ok: {
        label: game.i18n.localize("OSE.Roll"),
        icon: '<i class="fas fa-dice-d20"></i>',
        callback: (html) => {
          roll = OseDice.sendRoll({
            parts: parts,
            data: data,
            title: title,
            flavor: flavor,
            speaker: speaker,
            form: html[0].children[0],
          });
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("OSE.Cancel"),
      },
    };

    if (skipDialog) {
      return OseDice.sendRoll({
        parts,
        data,
        title,
        flavor,
        speaker,
      });
    }

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
