export const registerFVTTModuleAPIs = () => {
  // see docs for more info https://github.com/fantasycalendar/FoundryVTT-ItemPiles/blob/master/docs/api.md
  Hooks.once("item-piles-ready", async function () {

    if(game.itempiles.API.ACTOR_CLASS_TYPE !== "character"){
      await game.itempiles.API.setActorClassType("character");
    }

    if (game.itempiles.API.ITEM_QUANTITY_ATTRIBUTE !== "system.quantity.value") {
      await game.itempiles.API.setItemQuantityAttribute("system.quantity.value");
    }

    if (game.itempiles.API.ITEM_PRICE_ATTRIBUTE !== "system.cost") {
      await game.itempiles.API.setItemPriceAttribute("system.cost");
    }

    const filters = [{
      path: "type",
      filters: "spell,ability",
    }];
    if (JSON.stringify(game.itempiles.API.ITEM_FILTERS) !== JSON.stringify(filters)) {
      await game.itempiles.API.setItemFilters(filters);
    }

    const similarities = ["type", "type"];
    if (JSON.stringify(game.itempiles.API.ITEM_SIMILARITIES) !== JSON.stringify(similarities)) {
      await game.itempiles.API.setItemSimilarities(similarities);
    }

    const currencies = [{
        type: "item",
        name: "OSE.items.gp.long",
        img: "systems/ose/assets/gold.png",
        abbreviation: "{#}GP",
        data: {
          item: {
            "name": "Gold Pieces",
            "type": "item",
            "img": "systems/ose/assets/gold.png",
            "system": {
              "quantity": { "value": 1, "max": null },
              "weight": 0.1,
              "cost": 1,
              "treasure": true,
            }
          }
        },
        primary: true,
        exchangeRate: 1
    }];
    // Still allows people to customize their own currencies
    if (!game.itempiles.API.CURRENCIES.length) {
      await game.itempiles.API.setCurrencies(currencies);
    }

  });
};
