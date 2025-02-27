/**
 * @file A file that manages preloading our system templates
 */
import OSE from "./config";

const preloadHandlebarsTemplates = async () => {
  const templatePaths = [
    // Components
    `${OSE.systemPath()}/templates/actors/partials/lockable-input.html`,
    // Character Sheets
    `${OSE.systemPath()}/templates/actors/character-sheet.html`,
    `${OSE.systemPath()}/templates/actors/monster-sheet.html`,
    // Character Sheets Partials
    `${OSE.systemPath()}/templates/actors/partials/character-header.html`,
    `${OSE.systemPath()}/templates/actors/partials/character-attributes-tab.html`,
    `${OSE.systemPath()}/templates/actors/partials/character-abilities-tab.html`,
    `${OSE.systemPath()}/templates/actors/partials/character-spells-tab.html`,
    `${OSE.systemPath()}/templates/actors/partials/character-inventory-tab.html`,
    `${OSE.systemPath()}/templates/actors/partials/actor-item-summary.html`,
    `${OSE.systemPath()}/templates/actors/partials/character-notes-tab.html`,
    `${OSE.systemPath()}/templates/actors/partials/monster-header.html`,
    `${OSE.systemPath()}/templates/actors/partials/monster-attributes-tab.html`,
    `${OSE.systemPath()}/templates/actors/partials/active-effects-tab.html`,
    // Item Display
    `${OSE.systemPath()}/templates/actors/partials/item-auto-tags-partial.html`,
    // Item Sheet
    `${OSE.systemPath()}/templates/items/partials/active-effects-tab.html`,
    // Party Sheet
    `${OSE.systemPath()}/templates/apps/party-sheet.html`,
    // `${OSE.systemPath()}/templates/apps/party-xp.html`,
    // Combat Tab
    `${OSE.systemPath()}/templates/sidebar/combat-tracker.hbs`,
    `${OSE.systemPath()}/templates/sidebar/combat-tracker-combatant-individual.hbs`,
    `${OSE.systemPath()}/templates/sidebar/combat-tracker-combatant-group.hbs`,
    `${OSE.systemPath()}/templates/apps/combat-set-groups.hbs`,
  ];
  return loadTemplates(templatePaths);
};

export default preloadHandlebarsTemplates;
