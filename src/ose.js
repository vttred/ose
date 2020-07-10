// Import Modules
import { OseItemSheet } from "./module/item/item-sheet.js";
import { OseActorSheetCharacter } from "./module/actor/character-sheet.js";
import { OseActorSheetMonster } from "./module/actor/monster-sheet.js";
import { preloadHandlebarsTemplates } from "./module/preloadTemplates.js";
import { OseActor } from "./module/actor/entity.js";
import { OseItem } from "./module/item/entity.js";
import { OSE } from "./module/config.js";
import { registerSettings } from "./module/settings.js";
import { registerHelpers } from "./module/helpers.js";
import * as chat from "./module/chat.js";
import * as macros from "./module/macros.js";
import { OseCombat } from "./module/combat.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d6 + @initiative.value",
    decimals: 2,
  };

  CONFIG.OSE = OSE;

  game.ose = {
    rollItemMacro: macros.rollItemMacro,
  };

  // Custom Handlebars helpers
  registerHelpers();

  // Register custom system settings
  registerSettings();

  CONFIG.Actor.entityClass = OseActor;
  CONFIG.Item.entityClass = OseItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("ose", OseActorSheetCharacter, {
    types: ["character"],
    makeDefault: true,
  });
  Actors.registerSheet("ose", OseActorSheetMonster, {
    types: ["monster"],
    makeDefault: true,
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("ose", OseItemSheet, { makeDefault: true });

  await preloadHandlebarsTemplates();
});

/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once("setup", function () {
  // Localize CONFIG objects once up-front
  const toLocalize = ["saves_short", "saves_long", "scores", "armor", "colors"];
  for (let o of toLocalize) {
    CONFIG.OSE[o] = Object.entries(CONFIG.OSE[o]).reduce((obj, e) => {
      obj[e[0]] = game.i18n.localize(e[1]);
      return obj;
    }, {});
  }
});

Hooks.once("ready", async () => {
  Hooks.on("hotbarDrop", (bar, data, slot) =>
    macros.createOseMacro(data, slot)
  );
});

Hooks.on("renderSidebarTab", async (object, html) => {
  if (object instanceof Settings) {
    const template = "systems/ose/templates/chat/license.html";
    const rendered = await renderTemplate(template);
    html.find(".game-system").append(rendered);
  }
})

Hooks.on("preCreateCombatant", (combat, data, options, id) => {
  let init = game.settings.get("ose", "individualInit");
  if (!init) {
    OseCombat.addCombatant(combat, data, options, id);
  }
});

Hooks.on("preUpdateCombatant", (combat, combatant, data, diff, id) => {
  let init = game.settings.get("ose", "individualInit");
  if (data.initiative && !init) {
    let groupInit = data.initiative;
    combat.combatants.forEach((ct) => {
      if (
        ct.initiative &&
        ct._id != data._id &&
        ct.flags.ose.group == combatant.flags.ose.group
      ) {
        groupInit = ct.initiative;
        data.initiative = parseInt(groupInit);
      }
    });
  }
});

Hooks.on("renderCombatTracker", (object, html, data) => {
  let init = game.settings.get("ose", "individualInit");
  if (!init) {
    OseCombat.format(object, html, data);
  }
});

Hooks.on("preUpdateCombat", async (combat, data, diff, id) => {
  let init = game.settings.get("ose", "individualInit");
  if (!data.round || init) {
    return;
  }
  OseCombat.rollInitiative(combat, data, diff, id);
});

Hooks.on("renderChatLog", (app, html, data) => OseItem.chatListeners(html));
Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);
