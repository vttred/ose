export const skipRollDialogCheck = (event) => {
    const invertedCtrlBehavior = game.settings.get(game.system.id, "invertedCtrlBehavior");

    console.log('Helper triggered.')

    return invertedCtrlBehavior ? 
        !(event && (event.ctrlKey || event.metaKey))
        :
        (event && (event.ctrlKey || event.metaKey));
}