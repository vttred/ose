/**
 * @file System-level odifications to the way combat works
 */
import OSE from "./config";

const OseCombat = {
  STATUS_SLOW: -789,
  STATUS_DIZZY: -790,

  debounce(callback, wait) {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  },
  async rollInitiative(combat, data) {
    // Check groups
    data.combatants = [];
    const groups = {};
    const combatants = combat?.combatants;
    combatants.forEach((cbt) => {
      const group = cbt.getFlag(game.system.id, "group");
      groups[group] = { present: true };
      data.combatants.push(cbt);
    });
    // Roll init
    for (const group in groups) {
      // Object.keys(groups).forEach((group) => {
      const roll = new Roll("1d6").evaluate({ async: false });
      await roll.toMessage({
        flavor: game.i18n.format("OSE.roll.initiative", {
          group: CONFIG.OSE.colors[group],
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
        const actorData = data.combatants[i].actor?.system;
        if (actorData.isSlow) {
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
  },

  async resetInitiative(combat, data) {
    const reroll = game.settings.get(game.system.id, "rerollInitiative");
    if (!["reset", "reroll"].includes(reroll)) {
      return;
    }
    combat.resetAll();
  },

  async individualInitiative(combat, data) {
    const updates = [];
    const rolls = [];
    const combatants = combat?.combatants;
    for (let i = 0; i < combatants.size; i++) {
      const c = combatants.contents[i];
      // check if actor initiative has already been set for this round
      if (c?.initiative) {
        continue;
      }
      // This comes from foundry.js, had to remove the update turns thing
      // Roll initiative
      const cf = await c._getInitiativeFormula(c);
      const roll = await c.getInitiativeRoll(cf);
      rolls.push(roll);
      const data = { _id: c.id };
      updates.push(data);
    }
    // combine init rolls
    const pool = PoolTerm.fromRolls(rolls);
    const combinedRoll = await Roll.fromTerms([pool]);
    // get evaluated chat message
    const evalRoll = await combinedRoll.toMessage({}, { create: false });
    const rollArr = combinedRoll.terms[0].rolls;
    let msgContent = ``;
    for (const [i, roll] of rollArr.entries()) {
      // get combatant
      const cbt = game.combats.viewed.combatants.find(
        (c) => c.id === updates[i]._id
      );
      // add initiative value to update
      // check if actor is slow
      let value = cbt.actor?.system?.isSlow
        ? OseCombat.STATUS_SLOW
        : roll.total;
      // check if actor is defeated
      if (combat.settings.skipDefeated && cbt.isDefeated) {
        value = OseCombat.STATUS_DIZZY;
      }
      updates[i].initiative = value;

      // render template
      const template = `${OSE.systemPath()}/templates/chat/roll-individual-initiative.html`;
      const tData = {
        name: cbt.name,
        formula: roll.formula,
        result: roll.result,
        total: roll.total,
      };
      const rendered = await renderTemplate(template, tData);
      msgContent += rendered;
    }
    evalRoll.content = `
    <details>
    <summary>${game.i18n.localize("OSE.roll.individualInitGroup")}</summary>
    ${msgContent}
    </details>`;
    ChatMessage.create(evalRoll);
    // update tracker
    if (game.user.isGM)
      await combat.updateEmbeddedDocuments("Combatant", updates);
    data.turn = 0;
  },

  format(object, html, user) {
    html.find(".initiative").each((_, span) => {
      span.innerHTML =
        span.innerHTML === `${OseCombat.STATUS_SLOW}`
          ? '<i class="fas fa-weight-hanging"></i>'
          : span.innerHTML;
      span.innerHTML =
        span.innerHTML === `${OseCombat.STATUS_DIZZY}`
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

    const init = game.settings.get(game.system.id, "initiative") === "group";
    if (!init) {
      return;
    }

    html.find('.combat-control[data-control="rollNPC"]').remove();
    html.find('.combat-control[data-control="rollAll"]').remove();
    const trash = html.find(
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
      const color = cmbtant.getFlag(game.system.id, "group");

      // Append colored flag
      const controls = $(ct).find(".combatant-controls");
      controls.prepend(
        `<a class='combatant-control flag' style='color:${color}' title="${CONFIG.OSE.colors[color]}"><i class='fas fa-flag'></i></a>`
      );
    });
    OseCombat.addListeners(html);
  },

  updateCombatant(combatant, data) {
    const init = game.settings.get(game.system.id, "initiative");
    // Why do you reroll ?
    const actorData = combatant.actor?.system;
    if (actorData.isSlow) {
      data.initiative = -789;
      return;
    }
    if (data.initiative && init === "group") {
      const groupInit = data.initiative;
      const cmbtGroup = combatant.getFlag(game.system.id, "group");
      // Check if there are any members of the group with init
      game.combats.viewed.combatants.forEach((ct) => {
        const group = ct.getFlag(game.system.id, "group");
        if (
          ct.initiative &&
          ct.initiative != "-789.00" &&
          ct.id != data.id &&
          group === cmbtGroup &&
          game.user.isGM
        ) {
          // Set init
          combatant.update({ initiative: parseInt(groupInit) });
        }
      });
    }
  },

  announceListener(html) {
    html.find(".combatant-control.prepare-spell").click((ev) => {
      ev.preventDefault();
      // Toggle spell announcement
      const id = $(ev.currentTarget).closest(".combatant")[0].dataset
        .combatantId;
      const isActive = ev.currentTarget.classList.contains("active");
      const combatant = game.combat.combatants.get(id);
      combatant.setFlag(game.system.id, "prepareSpell", !isActive);
    });
    html.find(".combatant-control.move-combat").click((ev) => {
      ev.preventDefault();
      // Toggle spell announcement
      const id = $(ev.currentTarget).closest(".combatant")[0].dataset
        .combatantId;
      const isActive = ev.currentTarget.classList.contains("active");
      const combatant = game.combat.combatants.get(id);
      if (game.user.isGM) {
        combatant.setFlag(game.system.id, "moveInCombat", !isActive);
      }
    });
  },

  addListeners(html) {
    // Cycle through colors
    html.find(".combatant-control.flag").click((ev) => {
      if (!game.user.isGM) {
        return;
      }
      const currentColor = ev.currentTarget.style.color;
      const colors = Object.keys(CONFIG.OSE.colors);
      let index = colors.indexOf(currentColor);
      if (index + 1 === colors.length) {
        index = 0;
      } else {
        index++;
      }
      const id = $(ev.currentTarget).closest(".combatant")[0].dataset
        .combatantId;
      const combatant = game.combat.combatants.get(id);
      if (game.user.isGM) {
        combatant.setFlag(game.system.id, "group", colors[index]);
      }
    });

    html.find('.combat-control[data-control="reroll"]').click((ev) => {
      if (!game.combat) {
        return;
      }
      const data = {};
      OseCombat.rollInitiative(game.combat, data);
      if (game.user.isGM) {
        game.combat.update({ data }).then(() => {
          game.combat.setupTurns();
        });
      }
    });
  },

  addCombatant(combat, data, options, id) {
    const token = canvas.tokens.get(data.tokenId);
    let color = "black";
    const disposition = token?.disposition || token?.data?.disposition;
    switch (disposition) {
      case -1: {
        color = "red";
        break;
      }

      case 0: {
        color = "yellow";
        break;
      }

      case 1: {
        color = "green";
        break;
      }
    }
    data.flags = {
      ose: {
        group: color,
      },
    };
    combat.updateSource({ flags: { ose: { group: color } } });
  },

  activateCombatant(li) {
    const turn = game.combat.turns.findIndex(
      (turn) => turn.id === li.data("combatant-id")
    );
    if (game.user.isGM) {
      game.combat.update({ turn });
    }
  },

  addContextEntry(html, options) {
    options.unshift({
      name: "Set Active",
      icon: '<i class="fas fa-star-of-life"></i>',
      callback: OseCombat.activateCombatant,
    });
  },

  async preUpdateCombat(combat, data, diff, id) {
    const init = game.settings.get(game.system.id, "initiative");
    const reroll = game.settings.get(game.system.id, "rerollInitiative");
    if (!data.round) {
      return;
    }
    if (data.round !== 1) {
      if (reroll === "reset") {
        OseCombat.resetInitiative(combat, data, diff, id);
        return;
      }
      if (reroll === "keep") {
        return;
      }
    }
    if (init === "group") {
      OseCombat.rollInitiative(combat, data, diff, id);
    } else if (init === "individual") {
      OseCombat.individualInitiative(combat, data, diff, id);
    }
  },
};

export default OseCombat;
