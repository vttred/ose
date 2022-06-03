import { OSE } from "./config";

export class OseCombat {
  static STATUS_SLOW = -789;
  static STATUS_DIZZY = -790;

  static debounce(callback, wait) {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  }
  static async rollInitiative(combat, data) {
    console.log('roll init')
    // Check groups
    data.combatants = [];
    let groups = {};
    combat.data.combatants.forEach((cbt) => {
      const group = cbt.getFlag(game.system.id, "group");
      groups[group] = { present: true };
      data.combatants.push(cbt);
    });
    // Roll init
    for (let group in groups) {
      // Object.keys(groups).forEach((group) => {
      let roll = new Roll("1d6").evaluate({ async: false });
      await roll.toMessage({
        flavor: game.i18n.format("OSE.roll.initiative", {
          group: CONFIG["OSE"].colors[group],
        }),
      });
      groups[group].initiative = roll.total;
      // });
    }
    // Set init
    for (let i = 0; i < data.combatants.length; ++i) {
      if (game.user.isGM) {
        if (!data.combatants[i].actor) {
          return;
        }
        if (data.combatants[i].actor.data.data.isSlow) {
          await data.combatants[i].update({
            initiative: OseCombat.STATUS_SLOW,
          });
        } else {
          const group = data.combatants[i].getFlag(game.system.id, "group");
          this.debounce(
            data.combatants[i].update({ initiative: groups[group].initiative }),
            500
          );
        }
      }
    }

    await combat.setupTurns();
  }

  static async resetInitiative(combat, data) {
    let reroll = game.settings.get("ose", "rerollInitiative");
    if (!["reset", "reroll"].includes(reroll)) {
      return;
    }
    combat.resetAll();
    
  }

  static async individualInitiative(combat, data) {
    let updates = [];
    let rolls = [];
    for (let i = 0; i < combat.data.combatants.size; i++) {
      let c = combat.data.combatants.contents[i];
      // This comes from foundry.js, had to remove the update turns thing
      // Roll initiative
      const cf = await c._getInitiativeFormula(c);
      const roll = await c.getInitiativeRoll(cf);
      rolls.push(roll);
      const data = { _id: c.id };
      updates.push(data);
    }
    //combine init rolls
    const pool = PoolTerm.fromRolls(rolls);
    const combinedRoll = await Roll.fromTerms([pool]);
    //get evaluated chat message
    const evalRoll = await combinedRoll.toMessage({}, { create: false });
    let rollArr = combinedRoll.terms[0].rolls;
    let msgContent = ``;
    for (let i = 0; i < rollArr.length; i++) {
      let roll = rollArr[i];
      //get combatant
      let cbt = game.combats.viewed.combatants.find(
        (c) => c.id == updates[i]._id
      );
      //add initiative value to update
      //check if actor is slow
      let value = cbt.actor.data.data.isSlow
        ? OseCombat.STATUS_SLOW
        : roll.total;
      //check if actor is defeated
      if (combat.settings.skipDefeated && cbt.isDefeated) {
        value = OseCombat.STATUS_DIZZY;
      }
      updates[i].initiative = value;

      //render template
      let template = `${OSE.systemPath()}/templates/chat/roll-individual-initiative.html`;
      let tData = {
        name: cbt.name,
        formula: roll.formula,
        result: roll.result,
        total: roll.total,
      };
      let rendered = await renderTemplate(template, tData);
      msgContent += rendered;
    }
    evalRoll.content = `
    <details>
    <summary>${game.i18n.localize("OSE.roll.individualInitGroup")}</summary>
    ${msgContent}
    </details>`;
    ChatMessage.create(evalRoll);
    //update tracker
    if (game.user.isGM)
      await combat.updateEmbeddedDocuments("Combatant", updates);
    data.turn = 0;
  }

  static format(object, html, user) {
    html.find(".initiative").each((_, span) => {
      span.innerHTML =
        span.innerHTML == `${OseCombat.STATUS_SLOW}`
          ? '<i class="fas fa-weight-hanging"></i>'
          : span.innerHTML;
      span.innerHTML =
        span.innerHTML == `${OseCombat.STATUS_DIZZY}`
          ? '<i class="fas fa-dizzy"></i>'
          : span.innerHTML;
    });

    html.find(".combatant").each((_, ct) => {
      // Append spellcast and retreat
      const controls = $(ct).find(".combatant-controls .combatant-control");
      const cmbtant = object.viewed.combatants.get(ct.dataset.combatantId);
      const moveInCombat = cmbtant.getFlag(game.system.id, "moveInCombat");
      const preparingSpell = cmbtant.getFlag(game.system.id, "prepareSpell");
      const moveActive = moveInCombat ? "active" : "";
      controls
        .eq(1)
        .after(
          `<a class='combatant-control move-combat ${moveActive}' title="${game.i18n.localize(
            "OSE.CombatFlag.RetreatFromMeleeDeclared"
          )}"><i class='fas fa-walking'></i></a>`
        );
      const spellActive = preparingSpell ? "active" : "";
      controls
        .eq(1)
        .after(
          `<a class='combatant-control prepare-spell ${spellActive}' title="${game.i18n.localize(
            "OSE.CombatFlag.SpellDeclared"
          )}"><i class='fas fa-magic'></i></a>`
        );
    });
    OseCombat.announceListener(html);

    let init = game.settings.get("ose", "initiative") === "group";
    if (!init) {
      return;
    }

    html.find('.combat-control[data-control="rollNPC"]').remove();
    html.find('.combat-control[data-control="rollAll"]').remove();
    let trash = html.find(
      '.encounters .combat-control[data-control="endCombat"]'
    );
    $(
      '<a class="combat-control" data-control="reroll"><i class="fas fa-dice"></i></a>'
    ).insertBefore(trash);

    html.find(".combatant").each((_, ct) => {
      // Can't roll individual inits
      $(ct).find(".roll").remove();

      // Get group color
      const cmbtant = object.viewed.combatants.get(ct.dataset.combatantId);
      let color = cmbtant.getFlag(game.system.id, "group");

      // Append colored flag
      let controls = $(ct).find(".combatant-controls");
      controls.prepend(
        `<a class='combatant-control flag' style='color:${color}' title="${CONFIG.OSE.colors[color]}"><i class='fas fa-flag'></i></a>`
      );
    });
    OseCombat.addListeners(html);
  }

  static updateCombatant(combatant, data) {
    let init = game.settings.get("ose", "initiative");
    // Why do you reroll ?
    if (combatant.actor.data.data.isSlow) {
      data.initiative = -789;
      return;
    }
    if (data.initiative && init == "group") {
      let groupInit = data.initiative;
      const cmbtGroup = combatant.getFlag(game.system.id, "group");
      // Check if there are any members of the group with init
      game.combats.viewed.combatants.forEach((ct) => {
        const group = ct.getFlag(game.system.id, "group");
        if (
          ct.initiative &&
          ct.initiative != "-789.00" &&
          ct.id != data.id &&
          group == cmbtGroup
        ) {
          // Set init
          if (game.user.isGM) {
            combatant.update({ initiative: parseInt(groupInit) });
          }
        }
      });
    }
  }

  static announceListener(html) {
    html.find(".combatant-control.prepare-spell").click((ev) => {
      ev.preventDefault();
      // Toggle spell announcement
      let id = $(ev.currentTarget).closest(".combatant")[0].dataset.combatantId;
      let isActive = ev.currentTarget.classList.contains("active");
      const combatant = game.combat.combatants.get(id);
      combatant.setFlag(game.system.id, "prepareSpell", !isActive);
    });
    html.find(".combatant-control.move-combat").click((ev) => {
      ev.preventDefault();
      // Toggle spell announcement
      let id = $(ev.currentTarget).closest(".combatant")[0].dataset.combatantId;
      let isActive = ev.currentTarget.classList.contains("active");
      const combatant = game.combat.combatants.get(id);
      if (game.user.isGM) {
        combatant.setFlag(game.system.id, "moveInCombat", !isActive);
      }
    });
  }

  static addListeners(html) {
    // Cycle through colors
    html.find(".combatant-control.flag").click((ev) => {
      if (!game.user.isGM) {
        return;
      }
      let currentColor = ev.currentTarget.style.color;
      let colors = Object.keys(CONFIG.OSE.colors);
      let index = colors.indexOf(currentColor);
      if (index + 1 == colors.length) {
        index = 0;
      } else {
        index++;
      }
      let id = $(ev.currentTarget).closest(".combatant")[0].dataset.combatantId;
      const combatant = game.combat.combatants.get(id);
      if (game.user.isGM) {
        combatant.setFlag(game.system.id, "group", colors[index]);
      }
    });

    html.find('.combat-control[data-control="reroll"]').click((ev) => {
      if (!game.combat) {
        return;
      }
      let data = {};
      console.log('bingo')
      OseCombat.rollInitiative(game.combat, data);
      if (game.user.isGM) {
        game.combat.update({ data: data }).then(() => {
          game.combat.setupTurns();
        });
      }
    });
  }

  static addCombatant(combat, data, options, id) {
    let token = canvas.tokens.get(data.tokenId);
    let color = "black";
    switch (token.data.disposition) {
      case -1:
        color = "red";
        break;
      case 0:
        color = "yellow";
        break;
      case 1:
        color = "green";
        break;
    }
    data.flags = {
      ose: {
        group: color,
      },
    };
    combat.data.update({ flags: { ose: { group: color } } });
  }

  static activateCombatant(li) {
    const turn = game.combat.turns.findIndex(
      (turn) => turn.id === li.data("combatant-id")
    );
    if (game.user.isGM) {
      game.combat.update({ turn: turn });
    }
  }

  static addContextEntry(html, options) {
    options.unshift({
      name: "Set Active",
      icon: '<i class="fas fa-star-of-life"></i>',
      callback: OseCombat.activateCombatant,
    });
  }

  static async preUpdateCombat(combat, data, diff, id) {
    let init = game.settings.get("ose", "initiative");
    let reroll = game.settings.get("ose", "rerollInitiative");
    if (!data.round) {
      return;
    }
    if (data.round !== 1) {
      if (reroll === "reset") {
        OseCombat.resetInitiative(combat, data, diff, id);
        return;
      } else if (reroll === "keep") {
        return;
      }
    }
    if (init === "group") {
      OseCombat.rollInitiative(combat, data, diff, id);
    } else if (init === "individual") {
      OseCombat.individualInitiative(combat, data, diff, id);
    }
  }
}
