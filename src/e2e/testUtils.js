const inputDelay = 120;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * If there are messages, purge them.
 *
 * @returns {Promise} The promise from deleting messages
 */
export const trashChat = () =>
  game.messages.size > 0
    ? game.messages.documentClass.deleteDocuments([], { deleteAll: true })
    : null;

/**
 * Delays execution so the UI can catch up.
 *
 * @returns {Promise} The delay.
 */
export const waitForInput = () => delay(inputDelay);
