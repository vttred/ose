/**
 * @file Register APIs that help the system more gracefully integrate with other modules
 */

const registerFVTTModuleAPIs = () => {
  // see docs for more info https://github.com/fantasycalendar/FoundryVTT-ItemPiles/blob/master/docs/api.md
  Hooks.once("item-piles-ready", async () => {
    game.itempiles.API.addSystemIntegration({
      VERSION: "1.0.0",

      // The actor class type is the type of actor that will be used for the default item pile actor that is created on first item drop.
      ACTOR_CLASS_TYPE: "character",

      // The item quantity attribute is the path to the attribute on items that denote how many of that item that exists
      ITEM_QUANTITY_ATTRIBUTE: "system.quantity.value",

      // The item price attribute is the path to the attribute on each item that determine how much it costs
      ITEM_PRICE_ATTRIBUTE: "system.cost",

      // Item types and the filters actively remove items from the item pile inventory UI that users cannot loot, such as spells, feats, and classes
      ITEM_FILTERS: [
        {
          path: "type",
          filters: "spell,ability",
        },
      ],

      UNSTACKABLE_ITEM_TYPES: ["weapon", "armor", "container"],

      // Item similarities determines how item piles detect similarities and differences in the system
      ITEM_SIMILARITIES: ["name", "type", "system.treasure"],

      // Currencies in item piles is a versatile system that can accept actor attributes (a number field on the actor's sheet) or items (actual items in their inventory)
      // In the case of attributes, the path is relative to the "actor.system"
      // In the case of items, it is recommended you export the item with `.toObject()` and strip out any module data
      CURRENCIES: [
        {
          type: "item",
          name: "OSE.items.gp.long",
          img: "systems/ose/assets/gold.png",
          abbreviation: "{#}GP",
          data: {
            item: {
              name: "Cold Coins",
              type: "item",
              img: "systems/ose/assets/gold.png",
              system: {
                quantity: { value: 1, max: null },
                weight: 0.1,
                cost: 1,
                treasure: true,
              },
            },
          },
          primary: true,
          exchangeRate: 1,
        },
      ],
    });
  });
};

export default registerFVTTModuleAPIs;
