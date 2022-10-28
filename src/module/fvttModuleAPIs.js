export const registerFVTTModuleAPIs = () => {
  // see docs for more info https://github.com/fantasycalendar/FoundryVTT-ItemPiles/blob/master/docs/api.md
  Hooks.once("item-piles-ready", async function () {
    // @TODO: confirm with Wasp that this API should function in V10-compatible ItemPiles
    if (ItemPiles.API.ACTOR_CLASS_TYPE !== "character")
      ItemPiles.API.setActorClassType("character");
    if (ItemPiles.API.ITEM_QUANTITY_ATTRIBUTE !== "system.quantity.value")
      ItemPiles.API.setItemQuantityAttribute("system.quantity.value");
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
