import { OseActor } from "./actor/entity";

function canApplyDamage(html: JQuery) {
  if (!html.find('.dice-total').length) return false;
  const applyDamageOption = game.settings.get(game.system.id, "applyDamageOption");
  switch (applyDamageOption) {
    case CONFIG.OSE.apply_damage_options.originalTarget:
      return !!html.find(".chat-target").last().data("id");
    case CONFIG.OSE.apply_damage_options.targeted:
      return !!game.user?.targets?.size;
    case CONFIG.OSE.apply_damage_options.selected:
      return !!canvas.tokens?.controlled.length;
    default: {
      ui.notifications?.error(`unexpected OSE setting applyDamageOption: ${applyDamageOption}`);
      return false;
    }
  }
}

/**
 * This function is used to hook into the Chat Log context menu to add additional options to each message
 * These options make it easy to conveniently apply damage to controlled tokens based on the value of a Roll
 */
export const addChatMessageContextOptions = function (
  _: JQuery,
  options: ContextMenuEntry[]
) {
  let canApply: ContextMenuEntry["condition"] = (li) => canApplyDamage(li) && !!li.find(".dice-roll").length;
  options.push(
    {
      name: game.i18n.localize("OSE.messages.applyDamage"),
      icon: '<i class="fas fa-user-minus"></i>',
      condition: canApply,
      callback: (li) => applyChatCardDamage(li, 1),
    },
    {
      name: game.i18n.localize("OSE.messages.applyHealing"),
      icon: '<i class="fas fa-user-plus"></i>',
      condition: canApply,
      callback: (li) => applyChatCardDamage(li, -1),
    }
  );
  return options;
};

/* -------------------------------------------- */

export const addChatMessageButtons = function (msg: ChatMessage, html: JQuery) {
  // Hide blind rolls
  let blindable = html.find(".blindable");
  if (
    // @ts-ignore need to add ChatMessage document property updates.
    msg?.blind &&
    !game.user?.isGM &&
    blindable &&
    blindable.data("blind") === true
  ) {
    blindable.replaceWith(
      "<div class='dice-roll'><div class='dice-result'><div class='dice-formula'>???</div></div></div>"
    );
  }
  // Buttons
  let roll = html.find(".damage-roll");
  if (roll.length > 0 && canApplyDamage(html)) {
    roll.append(
      $(
        `<div class="dice-damage"><button type="button" data-action="apply-damage"><i class="fas fa-tint"></i></button></div>`
      )
    );
    roll.find('button[data-action="apply-damage"]').on("click", (ev) => {
      ev.preventDefault();
      applyChatCardDamage(html, 1);
    });
  }
};

/**
 * Apply rolled dice damage to the token or tokens which are currently controlled.
 * This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
 *
 * @param {HTMLElement} html    The chat entry which contains the roll data
 * @param {Number} multiplier   A damage multiplier to apply to the rolled damage.
 * @return {Promise}
 */
function applyChatCardDamage(html: JQuery, multiplier: 1 | -1) {
  const amount = html.find(".dice-total").last().text();
  const dmgTgt = game.settings.get(game.system.id, "applyDamageOption");
  if (dmgTgt === CONFIG.OSE.apply_damage_options.originalTarget) {
    const victimId = html.find(".chat-target").last().data("id");
    (async () => {
      const actor = ((await fromUuid(victimId || '')) as TokenDocument)?.actor;
      await applyDamageToTarget(actor, amount, multiplier, actor?.name || victimId || 'original target');
    })();
  }
  if (dmgTgt === CONFIG.OSE.apply_damage_options.targeted) {
    game.user?.targets.forEach((t) => applyDamageToTarget(t.actor, amount, multiplier, t.name));
  }
  if (dmgTgt === CONFIG.OSE.apply_damage_options.selected) {
    canvas.tokens?.controlled.forEach((t) => applyDamageToTarget(t.actor, amount, multiplier, t.name));
  }
}

async function applyDamageToTarget(actor: Actor | null, amount: string, multiplier: 1 | -1, nameOrId: string) {
  if (!game.user?.isGM || !(actor instanceof OseActor)) {
    ui.notifications?.error(`Can't deal damage to ${nameOrId}`);
    return;
  }
  await actor.applyDamage(amount, multiplier);
}
/* -------------------------------------------- */
