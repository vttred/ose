import { OsePartySheet } from "./dialog/party-sheet.js";

export const addControl = (object, html) => {
    let control = `<button class='ose-party-sheet' type="button" title='${game.i18n.localize('OSE.dialog.partysheet')}'><i class='fas fa-users'></i></button>`;
    html.find(".fas.fa-search").replaceWith($(control))
    html.find('.ose-party-sheet').click(ev => {
        showPartySheet(ev, object);
    })
}

export const showPartySheet = (event, object) => {
    event.preventDefault();
    new OsePartySheet(object, {
        top: window.screen.height / 2 - 180,
        left: window.screen.width / 2 - 140,
    }).render(true);
}

export const update = (actor, data) => {
    const partyFlag = actor.getFlag('ose', 'party');

    if (partyFlag === null) {
        return;
    }

    const partySheetUI = Object.values(ui.windows).find(win => { return win instanceof OsePartySheet });

    if (partySheetUI) {
        partySheetUI.render();
    }
}