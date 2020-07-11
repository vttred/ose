export const preloadHandlebarsTemplates = async function () {
    const templatePaths = [
        //Character Sheets
        'systems/ose/templates/actors/character-html.html',
        'systems/ose/templates/actors/monster-html.html',
        //Actor partials
        //Sheet tabs
        'systems/ose/templates/actors/partials/character-header.html',
        'systems/ose/templates/actors/partials/character-attributes-tab.html',
        'systems/ose/templates/actors/partials/character-abilities-tab.html',
        'systems/ose/templates/actors/partials/character-spells-tab.html',
        'systems/ose/templates/actors/partials/character-inventory-tab.html',
        'systems/ose/templates/actors/partials/character-notes-tab.html',

        'systems/ose/templates/actors/partials/monster-header.html',
        'systems/ose/templates/actors/partials/monster-attributes-tab.html'
    ];
    return loadTemplates(templatePaths);
};
