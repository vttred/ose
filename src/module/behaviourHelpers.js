export const skipRollDialogCheck = (event) => {
    const invertedCtrlBehavior = game.settings.get(game.system.id, "invertedCtrlBehavior");
    return invertedCtrlBehavior ? 
        !(event && (event.ctrlKey || event.metaKey))
        :
        (event && (event.ctrlKey || event.metaKey));
}