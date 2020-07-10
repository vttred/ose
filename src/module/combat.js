import { OseDice } from "./dice.js";

export class OseCombat {
  static rollInitiative(combat, data, diff, id) {
    // Check groups
    data.combatants = [];
    let groups = {};
    combat.data.combatants.forEach((cbt) => {
      groups[cbt.flags.ose.group] = {present: true};
      data.combatants.push(cbt);
    });
    
    // Roll init
    Object.keys(groups).forEach((group) => {
        let roll = new Roll("1d6").roll();
        roll.toMessage({flavor: `${CONFIG.OSE.colors[group]} group rolls initiative`});
        groups[group].initiative = roll.total;
    })
    
    // Set init
    for (let i = 0; i < data.combatants.length; ++i) {
        console.log(data.combatants[i]);
        if (data.combatants[i].actor.data.data.isSlow) {
          data.combatants[i].initiative = -1;
        } else {
          data.combatants[i].initiative = groups[data.combatants[i].flags.ose.group].initiative;
        }
    }
  }

  static format(object, html, user) {
    html.find('.combat-control[data-control="rollNPC"]').remove();
    html.find('.combat-control[data-control="rollAll"]').remove();
    html.find(".combatant").each((_, ct) => {
      // Can't roll individual inits
      $(ct).find(".roll").remove();

      // Get group color
      let cmbtant = object.combat.getCombatant(ct.dataset.combatantId);
      let color = cmbtant.flags.ose.group;

      // Append colored flag
      let controls = $(ct).find(".combatant-controls");
      controls.prepend(
        `<a class='combatant-control flag' style='color:${color}' title="${CONFIG.OSE.colors[color]}"><i class='fas fa-flag'></i></a>`
      );
    });
    OseCombat.addListeners(html);
  }

  static addListeners(html) {
    // Cycle through colors
    html.find(".combatant-control.flag").click((ev) => {
      let currentColor = ev.currentTarget.style.color;
      let colors = Object.keys(CONFIG.OSE.colors);
      let index = colors.indexOf(currentColor);
      if (index + 1 == colors.length) {
        index = 0;
      } else {
        index++;
      }
      let id = $(ev.currentTarget).closest(".combatant")[0].dataset.combatantId;
      game.combat.updateCombatant({
        _id: id,
        flags: { ose: { group: colors[index] } },
      });
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
  }
}
