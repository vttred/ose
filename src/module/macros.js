/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createOseMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data))
    return ui.notifications.warn(
      game.i18.localize("OSE.warn.macrosOnlyForOwnedItems")
    );
  const item = data;

  // Create the macro command
  const command = `game.ose.rollItemMacro("${item.name}");`;
  let macro = game.macros.contents.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "ose.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
export function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);

  // Get matching items
  const items = actor ? actor.items.filter((i) => i.name === itemName) : [];
  if (items.length > 1) {
    ui.notifications.warn(
      game.i18n.format("OSE.warn.moreThanOneItemWithName", {
        actorName: actor.name,
        itemName: itemName,
      })
    );
  } else if (items.length === 0) {
    return ui.notifications.error(
      game.i18n.format("OSE.warn.noItemWithName", {
        actorName: actor.name,
        itemName: itemName,
      })
    );
  }
  const item = items[0];

  // Trigger the item roll
  return item.roll();
}
