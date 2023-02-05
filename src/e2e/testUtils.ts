/**
 * @file Utilities for our Quench tests
 */

const inputDelay = 120;

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

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

export const openWindows = (className: string) =>
  Object.values(ui.windows).filter((o) =>
    o.options.classes.includes(className)
  );

export const openDialogs = () =>
  Object.values(ui.windows).filter((o) => o.options.classes.includes("dialog"))

export const closeDialogs = async () => {
  openDialogs()?.forEach(async (o) => {
    await o.close();
  });
};

/**
 * MOCKING HELPERS
 */

export const createMockActorKey = async (
  type: string,
  data: object = {},
  key: string = ""
) =>
  Actor.create({
    ...data,
    name: `Test Actor ${key}`,
    type,
  });

export const createWorldTestItem = async (type: string) =>
  Item.create({
    type,
    name: `New World Test ${type.capitalize()}`,
  });

export const createActorTestItem = async (
  actor: StoredDocument<Actor>,
  type: string
) =>
  actor.createEmbeddedDocuments(
    "Item",
    [{ type, name: `New Actor Test ${type.capitalize()}` }],
    {}
  );

export const createMockScene = async () =>
  Scene.create({ name: "Mock Scene", tokenVision: true });

/**
 * CLEANUP HELPERS
 */

export const cleanUpMacros = () => {
  const mockMacros = game.macros?.filter((o) =>
    o.name.includes("New Actor Test")
  );
  mockMacros?.forEach((o) => o.delete());
};

export const cleanUpActorsKey = (key) => {
  game.actors
    ?.filter((a) => a.name === `Test Actor ${key}`)
    .forEach((a) => a.delete());
};

export const cleanUpWorldItems = () => {
  game.items
    ?.filter((a) => a?.name?.includes("New World Test"))
    .forEach((a) => a.delete());
};

export const cleanUpScenes = () => {
  game.scenes
    ?.filter((s) => s.name === "Mock Scene")
    .forEach((s) => s.delete());
};
