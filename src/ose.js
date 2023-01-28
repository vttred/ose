// Import Modules
import { OseItemSheet } from "./module/item/item-sheet";
import { OseActorSheetCharacter } from "./module/actor/character-sheet";
import { OseActorSheetMonster } from "./module/actor/monster-sheet";
import { preloadHandlebarsTemplates } from "./module/preloadTemplates";
import { OseActor } from "./module/actor/entity";
import { OseItem } from "./module/item/entity";
import { OSE } from "./module/config";
import { registerSettings } from "./module/settings";
import { registerHelpers } from "./module/helpers";
import { registerFVTTModuleAPIs } from "./module/fvttModuleAPIs";
import * as chat from "./module/chat";
import * as treasure from "./module/treasure";
import * as macros from "./module/macros";
import * as party from "./module/party";
import { OseCombat } from "./module/combat";
import * as renderList from "./module/renderList";
import { OsePartySheet } from "./module/party/party-sheet";
import './e2e';

import OseDataModelCharacter from './module/actor/data-model-character';
import OseDataModelMonster from './module/actor/data-model-monster';
import OseDataModelWeapon from './module/item/data-model-weapon';
import OseDataModelArmor from './module/item/data-model-armor';
import OseDataModelItem from './module/item/data-model-item';
import OseDataModelSpell from './module/item/data-model-spell';
import OseDataModelAbility  from './module/item/data-model-ability';
import OseDataModelContainer from './module/item/data-model-container';


/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d6 + @init",
    decimals: 2,
  };

  CONFIG.OSE = OSE;

  game.ose = {
    rollItemMacro: macros.rollItemMacro,
    oseCombat: OseCombat,
  };

  // Init Party Sheet handler
  OsePartySheet.init();

  // Custom Handlebars helpers
  registerHelpers();
  
  // Give modules a chance to add encumbrance schemes
  // They can do so by adding their encumbrance schemes
  // to CONFIG.OSE.encumbranceOptions
  Hooks.call('ose-setup-encumbrance');

  // Register custom system settings
  registerSettings();

  // Register APIs of Foundry VTT Modules we explicitly support that provide custom hooks
  registerFVTTModuleAPIs();

  CONFIG.Actor.documentClass = OseActor;
  CONFIG.Item.documentClass = OseItem;

  CONFIG.Actor.systemDataModels = {
    character: OseDataModelCharacter,
    monster: OseDataModelMonster,
  }
  CONFIG.Item.systemDataModels = {
    weapon: OseDataModelWeapon,
    armor: OseDataModelArmor,
    item: OseDataModelItem,
    spell: OseDataModelSpell,
    ability: OseDataModelAbility,
    container: OseDataModelContainer,
  }

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(game.system.id, OseActorSheetCharacter, {
    types: ["character"],
    makeDefault: true,
    label: "OSE.SheetClassCharacter",
  });
  Actors.registerSheet(game.system.id, OseActorSheetMonster, {
    types: ["monster"],
    makeDefault: true,
    label: "OSE.SheetClassMonster",
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(game.system.id, OseItemSheet, {
    makeDefault: true,
    label: "OSE.SheetClassItem",
  });

  await preloadHandlebarsTemplates();
});

/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once("setup", function () {
  // Localize CONFIG objects once up-front
  const toLocalize = [
    "saves_short",
    "saves_long",
    "scores",
    "armor",
    "colors",
    "tags",
  ];
  for (let o of toLocalize) {
    CONFIG.OSE[o] = Object.entries(CONFIG.OSE[o]).reduce((obj, e) => {
      obj[e[0]] = game.i18n.localize(e[1]);
      return obj;
    }, {});
  }

  // Custom languages
  const languages = game.settings.get(game.system.id, "languages");
  if (languages != "") {
    const langArray = languages.split(",");
    langArray.forEach((l, i) => (langArray[i] = l.trim()));
    CONFIG.OSE.languages = langArray;
  }
});

Hooks.once("ready", async () => {
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    macros.createOseMacro(data, slot);
    // Returning false to stop the rest of hotbarDrop handling.
    return false;
  });
});

// License info
Hooks.on("renderSidebarTab", async (object, html) => {
  if (object instanceof ActorDirectory) {
    party.addControl(object, html);
  }
  if (object instanceof Settings) {
    let gamesystem = html.find("#game-details");
    // SRD Link
    let ose = gamesystem.find("h4").last();
    ose.append(
      ` <sub><a href="https://oldschoolessentials.necroticgnome.com/srd/index.php">SRD<a></sub>`
    );

    // License text
    const template = `${OSE.systemPath()}/templates/chat/license.html`;
    const rendered = await renderTemplate(template);
    gamesystem.find(".system").append(rendered);

    // User guide
    let docs = html.find("button[data-action='docs']");
    const styling =
      "border:none;margin-right:2px;vertical-align:middle;margin-bottom:5px";
    $(
      `<button type="button" data-action="userguide"><img src='${OSE.assetsPath}/dragon.png' width='16' height='16' style='${styling}'/>Old School Guide</button>`
    ).insertAfter(docs);
    html.find('button[data-action="userguide"]').click((ev) => {
      new FrameViewer("https://vttred.github.io/ose", {
        resizable: true,
      }).render(true);
    });
  }
});

Hooks.on("preCreateCombatant", (combat, data, options, id) => {
  let init = game.settings.get(game.system.id, "initiative");
  if (init == "group") {
    OseCombat.addCombatant(combat, data, options, id);
  }
});

Hooks.on("updateCombatant", OseCombat.debounce(OseCombat.updateCombatant), 100);
Hooks.on("renderCombatTracker", OseCombat.debounce(OseCombat.format, 100));
Hooks.on("preUpdateCombat", OseCombat.preUpdateCombat);
Hooks.on(
  "getCombatTrackerEntryContext",
  OseCombat.debounce(OseCombat.addContextEntry, 100)
);

Hooks.on("renderChatLog", (app, html, data) => OseItem.chatListeners(html));
Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);
Hooks.on("renderChatMessage", chat.addChatMessageButtons);
Hooks.on("renderRollTableConfig", treasure.augmentTable);
Hooks.on("updateActor", party.update);

Hooks.on("renderCompendium", renderList.RenderCompendium);
Hooks.on("renderSidebarDirectory", renderList.RenderDirectory);

Hooks.on("OSE.Party.showSheet", OsePartySheet.showPartySheet);
