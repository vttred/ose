import { OsePartySheet } from "./dialog/party-sheet.js";

export const addControl = (object, html) => {
    let control = `<a class='ose-party-sheet' title='${game.i18n.localize('OSE.dialog.partysheet')}'><i class='fas fa-users'></i></a>`;
    html.find(".fas.fa-search").replaceWith($(control))
    html.find('.ose-party-sheet').click(ev => {
        showPartySheet(object);
    })
}

export const showPartySheet = (object) => {
    event.preventDefault();
    new OsePartySheet(object, {
      top: window.screen.height / 2,
      left:window.screen.width / 2,
    }).render(true);
}