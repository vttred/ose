/**
 * @file Contains helpers for various behaviors
 */

/**
 * Checks if dialogs should be skipped, depending on settings
 *
 * @param {Event} event - Event that triggers a skippable dialog
 * @returns {boolean} - Returns true if dialog should be skipped
 */
const skipRollDialogCheck = (event) => {
  const invertedCtrlBehavior = game.settings.get(
    game.system.id,
    "invertedCtrlBehavior"
  );
  return invertedCtrlBehavior
    ? !(event && (event.ctrlKey || event.metaKey))
    : event && (event.ctrlKey || event.metaKey);
};

export default skipRollDialogCheck;
