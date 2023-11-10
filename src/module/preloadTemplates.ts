/**
 * @file A file that manages preloading our system templates
 */
import { OSE } from "./config";

const preloadHandlebarsTemplates = async () => {
  const templatePaths = [
    // Character Sheets
    `${OSE.systemPath()}/templates/actors/character-sheet.html`,
    `${OSE.systemPath()}/templates/actors/character-sheet-2-0.hbs`,
    `${OSE.systemPath()}/templates/actors/monster-sheet.html`,
    // Character sheet partials (v1)
    `${OSE.systemPath()}/templates/actors/partials/character-header.html`,
    `${OSE.systemPath()}/templates/actors/partials/character-attributes-tab.html`,
    `${OSE.systemPath()}/templates/actors/partials/character-abilities-tab.html`,
    `${OSE.systemPath()}/templates/actors/partials/character-spells-tab.html`,
    `${OSE.systemPath()}/templates/actors/partials/character-inventory-tab.html`,
    `${OSE.systemPath()}/templates/actors/partials/actor-item-summary.html`,
    `${OSE.systemPath()}/templates/actors/partials/character-notes-tab.html`,
    // Monster sheet partials (v1)
    `${OSE.systemPath()}/templates/actors/partials/monster-header.html`,
    `${OSE.systemPath()}/templates/actors/partials/monster-attributes-tab.html`,
    // Character sheet partials (v2)
    `${OSE.systemPath()}/templates/actors/partials/sheet-v2/character-combat-tab.hbs`,
    `${OSE.systemPath()}/templates/actors/partials/sheet-v2/character-abilities-tab.hbs`,
    `${OSE.systemPath()}/templates/actors/partials/sheet-v2/character-magic-tab.hbs`,
    `${OSE.systemPath()}/templates/actors/partials/sheet-v2/character-inventory-tab.hbs`,
    `${OSE.systemPath()}/templates/actors/partials/sheet-v2/character-notes-tab.hbs`,
    // Character sheet input components (v2)
    `${OSE.systemPath()}/templates/actors/partials/sheet-v2/components/ability-score-field.hbs`,
    `${OSE.systemPath()}/templates/actors/partials/sheet-v2/components/character-ability-field.hbs`,
    `${OSE.systemPath()}/templates/actors/partials/sheet-v2/components/character-info-field.hbs`,
    `${OSE.systemPath()}/templates/actors/partials/sheet-v2/components/major-icon-field.hbs`,
    `${OSE.systemPath()}/templates/actors/partials/sheet-v2/components/spell-slot-field.hbs`,

    // Item Display
    `${OSE.systemPath()}/templates/actors/partials/item-auto-tags-partial.html`,
    // Party Sheet
    `${OSE.systemPath()}/templates/apps/party-sheet.html`,
    // `${OSE.systemPath()}/templates/apps/party-xp.html`,
  ];
  return loadTemplates(templatePaths);
};

export default preloadHandlebarsTemplates;
