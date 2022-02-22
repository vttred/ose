export const registerFVTTModuleAPIs = () => {
  // see docs for more info https://github.com/fantasycalendar/FoundryVTT-ItemPiles/blob/master/docs/api.md
  Hooks.once("item-piles-ready", async function () {
    if (ItemPiles.API.ACTOR_CLASS_TYPE !== "character")
      ItemPiles.API.setActorClassType("character");
    if (ItemPiles.API.ITEM_QUANTITY_ATTRIBUTE !== "data.quantity.value")
      ItemPiles.API.setItemQuantityAttribute("data.quantity.value");
    if (
      ItemPiles.API.ITEM_FILTERS !==
      [
        {
          path: "type",
          filters: "spell,ability",
        },
      ]
    )
      ItemPiles.API.setItemFilters([
        {
          path: "type",
          filters: "spell,ability",
        },
      ]);
  });
};
