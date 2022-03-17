import { OsePartySheet } from "./party/party-sheet.js";

export const addControl = (object, html) => {
    let control = `<button class='ose-party-sheet' type="button" title='${game.i18n.localize('OSE.dialog.partysheet')}'><i class='fas fa-users'></i></button>`;
    html.find(".fas.fa-search").replaceWith($(control));
    html.find('.ose-party-sheet').click(ev => {
        ev.preventDefault();
        Hooks.call("OSE.Party.showSheet");
    });
}

export const update = (actor, data) => {
    const partyFlag = actor.getFlag('ose', 'party');

    if (partyFlag === null) {
        return;
    }

    OsePartySheet.partySheet.render();
}