/**
 * @file Functions that make working with hotbar macros easier
 */
/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 *
 * @param {object} data - The dropped data
 * @param {number} slot - The hotbar slot to use
 * @returns {Promise} - Promise of assigned macro or a notification
 */
export async function createOseMacro(data, slot) {
  if (data.type === "Macro") {
    return game.user.assignHotbarMacro(await fromUuid(data.uuid), slot);
  }
  if (data.uuid.startsWith("RollTable.")) {
    const table = await game.tables.find((t) => t.uuid === data.uuid);
    const command = `game.ose.rollTableMacro("${table.id}");`;
    const macro = await Macro.create({
      name: table.name,
      type: "script",
      img: table.img,
      command,
      flags: { "ose.tableMacro": true },
    });
    return game.user.assignHotbarMacro(macro, slot);
  }
  if (data.type !== "Item")
    return ui.notifications.warn(
      game.i18n.localize("OSE.warn.macrosNotAnItem")
    );
  if (data.uuid.indexOf("Item.") <= 0)
    return ui.notifications.warn(
      game.i18n.localize("OSE.warn.macrosOnlyForOwnedItems")
    );
  const { item } = data;

  // Create the macro command
  const command = `game.ose.rollItemMacro("${item.name}");`;
  let macro = game.macros.contents.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro || macro.ownership[game.userId] === undefined) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command,
      flags: { "ose.itemMacro": true },
    });
  }
  return game.user.assignHotbarMacro(macro, slot);
}

/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 *
 * @param {string} itemName - Name of item to roll
 * @returns {Promise} - Promise of item roll or notification
 */
export function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  // Active actor, or inactive actor + token on scene allowed
  if (!(speaker.actor && speaker.scene))
    return ui.notifications.warn(
        game.i18n.localize("OSE.warn.macrosNoTokenOwnedInScene")
    );

  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);

  // Get matching items
  const items = actor ? actor.items.filter((i) => i.name === itemName) : [];
  if (items.length > 1) {
    ui.notifications.warn(
        game.i18n.format("OSE.warn.moreThanOneItemWithName", {
          actorName: actor.name,
          itemName,
        })
    );
  } else if (items.length === 0) {
    return ui.notifications.error(
        game.i18n.format("OSE.error.noItemWithName", {
          actorName: actor.name,
          itemName,
        })
    );
  }
  const item = items[0];

  // Trigger the item roll
  return item.roll();
}

/**
 * Create a Macro from a Table drop.
 * Get an existing table macro if one exists, otherwise create a new one.
 *
 * @param {string} tableId - Name of item to roll
 * @returns {Promise} - Promise of item roll or notification
 */
export function rollTableMacro(tableId) {
  return game.tables.get(tableId).draw({ roll: true, displayChat: true });
}
