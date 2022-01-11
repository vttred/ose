export const preloadHandlebarsTemplates = async function () {
  const templatePaths = [
    //Character Sheets
    "systems/ose/dist/templates/actors/character-sheet.html",
    "systems/ose/dist/templates/actors/monster-sheet.html",
    //Actor partials
    //Sheet tabs
    "systems/ose/dist/templates/actors/partials/character-header.html",
    "systems/ose/dist/templates/actors/partials/character-attributes-tab.html",
    "systems/ose/dist/templates/actors/partials/character-abilities-tab.html",
    "systems/ose/dist/templates/actors/partials/character-spells-tab.html",
    "systems/ose/dist/templates/actors/partials/character-inventory-tab.html",
    "systems/ose/dist/templates/actors/partials/character-notes-tab.html",

    "systems/ose/dist/templates/actors/partials/monster-header.html",
    "systems/ose/dist/templates/actors/partials/monster-attributes-tab.html",
  ];
  return loadTemplates(templatePaths);
};
