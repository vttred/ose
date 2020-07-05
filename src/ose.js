// Import Modules
import { OseItemSheet } from "./module/item/item-sheet.js";
import { OseActorSheetCharacter } from "./module/actor/character-sheet.js";
import { OseActorSheetMonster } from "./module/actor/monster-sheet.js";
import { preloadHandlebarsTemplates } from "./module/preloadTemplates.js";
import { OseActor } from "./module/actor/entity.js";
import { OseItem } from "./module/item/entity.js";
import { OSE } from "./module/config.js";
import { registerSettings } from './module/settings.js';
import { registerHelpers } from './module/helpers.js';
import * as chat from "./module/chat.js";

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
  const toLocalize = ["saves_short", "saves_long", "scores"];
  for (let o of toLocalize) {
    CONFIG.OSE[o] = Object.entries(CONFIG.OSE[o]).reduce((obj, e) => {
      obj[e[0]] = game.i18n.localize(e[1]);
      return obj;
    }, {});
  }
});

Hooks.on("renderChatLog", (app, html, data) => OseItem.chatListeners(html));
Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);