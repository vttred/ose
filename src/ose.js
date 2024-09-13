/**
 * @file The entry point for the OSE system
 *       We should handle most of our setup here.
 */
import OseActorSheetCharacter from "./module/actor/character-sheet";
import OseDataModelCharacter from "./module/actor/data-model-character";
import OseDataModelMonster from "./module/actor/data-model-monster";
import OseActor from "./module/actor/entity";
import OseActorSheetMonster from "./module/actor/monster-sheet";

import OseDataModelAbility from "./module/item/data-model-ability";
import OseDataModelArmor from "./module/item/data-model-armor";
import OseDataModelContainer from "./module/item/data-model-container";
import OseDataModelItem from "./module/item/data-model-item";
import OseDataModelSpell from "./module/item/data-model-spell";
import OseDataModelWeapon from "./module/item/data-model-weapon";
import OseItem from "./module/item/entity";
import OseItemSheet from "./module/item/item-sheet";

import * as chat from "./module/helpers-chat";
import OSE from "./module/config";
import registerFVTTModuleAPIs from "./module/fvttModuleAPIs";
import handlebarsHelpers from "./module/helpers-handlebars";
import * as macros from "./module/helpers-macros";
import * as party from "./module/helpers-party";
import OsePartySheet from "./module/party/party-sheet";
import templates from "./module/preloadTemplates";
import * as renderList from "./module/renderList";
import registerSettings from "./module/settings";
import * as treasure from "./module/helpers-treasure";

import "./e2e";
import polyfill from "./module/polyfill";

// Combat
import { OSEGroupCombat } from "./module/combat/combat-group";
import { OSEGroupCombatant } from "./module/combat/combatant-group";
import { OSECombat } from "./module/combat/combat";
import { OSECombatant } from "./module/combat/combatant";
import { OSECombatTab } from "./module/combat/sidebar";



polyfill();

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async () => {
  // Give modules a chance to add encumbrance schemes
  // They can do so by adding their encumbrance schemes
  // to CONFIG.OSE.encumbranceOptions
  Hooks.call("ose-setup-encumbrance");

  CONFIG.OSE = OSE;

  // if (game.system.id === 'ose-dev') {
    CONFIG.debug = {
      ...CONFIG.debug,
      combat: true,
    }
  // }

  // Register custom system settings
  registerSettings();

  const isGroupInitiative = game.settings.get(game.system.id, "initiative") === "group";
  if (isGroupInitiative) { 
    CONFIG.Combat.documentClass = OSEGroupCombat;
    CONFIG.Combatant.documentClass = OSEGroupCombatant;
    CONFIG.Combat.initiative = { decimals: 2, formula: OSEGroupCombat.FORMULA }
  } else {
    CONFIG.Combat.documentClass = OSECombat;
    CONFIG.Combatant.documentClass = OSECombatant;
    CONFIG.Combat.initiative = { decimals: 2, formula: OSECombat.FORMULA }
  }

  CONFIG.ui.combat = OSECombatTab;
  
  game.ose = {
    rollItemMacro: macros.rollItemMacro,
    rollTableMacro: macros.rollTableMacro,
  };

  // Init Party Sheet handler
  OsePartySheet.init();

  // Custom Handlebars helpers
  handlebarsHelpers();

  // Register APIs of Foundry VTT Modules we explicitly support that provide custom hooks
  registerFVTTModuleAPIs();

  CONFIG.Actor.documentClass = OseActor;
  CONFIG.Item.documentClass = OseItem;

  CONFIG.Actor.systemDataModels = {
    character: OseDataModelCharacter,
    monster: OseDataModelMonster,
  };
  CONFIG.Item.systemDataModels = {
    weapon: OseDataModelWeapon,
    armor: OseDataModelArmor,
    item: OseDataModelItem,
    spell: OseDataModelSpell,
    ability: OseDataModelAbility,
    container: OseDataModelContainer,
  };

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

  await templates();
});

/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once("setup", () => {
  // Localize CONFIG objects once up-front
  ["saves_short", "saves_long", "scores", "armor", "colors", "tags"].forEach(
    (o) => {
      CONFIG.OSE[o] = Object.entries(CONFIG.OSE[o]).reduce((obj, e) => {
        const localized = { ...obj };
        localized[e[0]] = game.i18n.localize(e[1]);
        return localized;
      }, {});
    }
  );

  // Custom languages
  const languages = game.settings.get(game.system.id, "languages");
  if (languages !== "") {
    const langArray = languages.split(",").map((s) => s.trim());
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
    const gamesystem = html.find("#game-details");
    // SRD Link
    const ose = gamesystem.find("h4").last();
    ose.append(
      ` <sub><a href="https://oldschoolessentials.necroticgnome.com/srd/index.php">SRD<a></sub>`
    );

    // License text
    const template = `${OSE.systemPath()}/templates/chat/license.html`;
    const rendered = await renderTemplate(template);
    gamesystem.find(".system").append(rendered);

    // User guide
    const docs = html.find("button[data-action='docs']");
    const styling =
      "border:none;margin-right:2px;vertical-align:middle;margin-bottom:5px";
    $(
      `<button type="button" data-action="userguide"><img src='${OSE.assetsPath}/dragon.png' width='16' height='16' style='${styling}'/>Old School Guide</button>`
    ).insertAfter(docs);
    html.find('button[data-action="userguide"]').click(() => {
      new FrameViewer("https://ose.vtt.red/", {
        resizable: true,
      }).render(true);
    });
  }
});

Hooks.on("renderChatLog", (app, html) => OseItem.chatListeners(html));
Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);
Hooks.on("renderChatMessage", chat.addChatMessageButtons);
Hooks.on("renderRollTableConfig", treasure.augmentTable);
Hooks.on("updateActor", party.update);

Hooks.on("renderCompendium", renderList.RenderCompendium);
Hooks.on("renderSidebarDirectory", renderList.RenderDirectory);

Hooks.on("OSE.Party.showSheet", OsePartySheet.showPartySheet);
