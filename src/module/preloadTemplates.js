export const preloadHandlebarsTemplates = async function () {
  const templatePaths = [
    //Character Sheets
    "systems/ose/dist/templates/actors/character-sheet.html",
    "systems/ose/dist/templates/actors/monster-sheet.html",

    //Character Sheets Partials
    "systems/ose/dist/templates/actors/partials/character-header.html",
    "systems/ose/dist/templates/actors/partials/character-attributes-tab.html",
    "systems/ose/dist/templates/actors/partials/character-abilities-tab.html",
    "systems/ose/dist/templates/actors/partials/character-spells-tab.html",
    "systems/ose/dist/templates/actors/partials/character-inventory-tab.html",
    "systems/ose/dist/templates/actors/partials/actor-item-summary.html",
    "systems/ose/dist/templates/actors/partials/character-notes-tab.html",
    "systems/ose/dist/templates/actors/partials/monster-header.html",
    "systems/ose/dist/templates/actors/partials/monster-attributes-tab.html",

    // Item Display
    "systems/ose/dist/templates/actors/partials/item-auto-tags-partial.html",

    // Party Sheet
    "systems/ose/dist/templates/apps/party-sheet.html",
    "systems/ose/dist/templates/apps/party-xp.html",
  ];
  return loadTemplates(templatePaths);
};
