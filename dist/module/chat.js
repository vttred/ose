/**
 * This function is used to hook into the Chat Log context menu to add additional options to each message
 * These options make it easy to conveniently apply damage to controlled tokens based on the value of a Roll
 *
 * @param {HTMLElement} html    The Chat Message being rendered
 * @param {Array} options       The Array of Context Menu options
 *
 * @return {Array}              The extended options Array including new context choices
 */
export const addChatMessageContextOptions = function(html, options) {
  let canApply = li => canvas.tokens.controlled.length && li.find(".dice-roll").length;
  options.push(
    {
      name: game.i18n.localize("OSE.messages.applyDamage"),
      icon: '<i class="fas fa-user-minus"></i>',
      condition: canApply,
      callback: li => applyChatCardDamage(li, 1)
    },
    {
      name: game.i18n.localize("OSE.messages.applyHealing"),
      icon: '<i class="fas fa-user-plus"></i>',
      condition: canApply,
      callback: li => applyChatCardDamage(li, -1)
    }
  );
  return options;
};

/* -------------------------------------------- */

export const addChatMessageButtons = function(msg, html, data) {
  // Hide blind rolls
  let blindable = html.find('.blindable');
  if (msg.data.blind && !game.user.isGM && blindable && blindable.data('blind') === true) {
    blindable.replaceWith("<div class='dice-roll'><div class='dice-result'><div class='dice-formula'>???</div></div></div>");
  }
  // Buttons
  let roll = html.find('.damage-roll');
  if (roll.length > 0) {
    let total = roll.find('.dice-total');
    let value = total.text();
    roll.append($(`<div class="dice-damage"><button type="button" data-action="apply-damage"><i class="fas fa-tint"></i></button></div>`))
    roll.find('button[data-action="apply-damage"]').click((ev) => {
      ev.preventDefault();
      applyChatCardDamage(roll, 1);
    })
  }
}

/**
 * Apply rolled dice damage to the token or tokens which are currently controlled.
 * This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
 *
 * @param {HTMLElement} roll    The chat entry which contains the roll data
 * @param {Number} multiplier   A damage multiplier to apply to the rolled damage.
 * @return {Promise}
 */
function applyChatCardDamage(roll, multiplier) {
  const amount = roll.find('.dice-total').last().text();
  return Promise.all(canvas.tokens.controlled.map(t => {
    const a = t.actor;
    return a.applyDamage(amount, multiplier);
  }));
}

/* -------------------------------------------- */
