/**
 * @file Helper functions for managing the Party Sheet
 */
import OsePartySheet from "./party/party-sheet";

export const addControl = (object, html) => {
  const control = `<button class='ose-party-sheet' type="button" title='${game.i18n.localize(
    "OSE.dialog.partysheet"
  )}'><i class='fas fa-users'></i></button>`;
  html.find(".toggle-search-mode").before($(control));
  html.find(".ose-party-sheet").click((ev) => {
    ev.preventDefault();
    Hooks.call("OSE.Party.showSheet");
  });
};

export const update = (actor) => {
  const partyFlag = actor.getFlag(game.system.id, "party");

  if (partyFlag === null) {
    return;
  }

  OsePartySheet.partySheet.render();
};
