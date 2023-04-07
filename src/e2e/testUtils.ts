/**
 * @file Utilities for our Quench tests
 */

const inputDelay = 120;

export const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * If there are messages, purge them.
 */
export const trashChat = (): any => {
  if (game.messages?.size)
    game.messages?.documentClass.deleteDocuments([], { deleteAll: true });
};

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
  Object.values(ui.windows).filter((o) => o.options.classes.includes("dialog"));

export const closeDialogs = async () => {
  openDialogs()?.forEach(async (o) => {
    await o.close();
  });
};

export const closeSheets = async () => {
  openWindows("sheet").forEach(async (w) => w.close());
  waitForInput();
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

export const createWorldTestItem = async (
  type: string,
  name: string = `New World Test ${type.capitalize()}`
) =>
  Item.create({
    type,
    name,
  });

export const createActorTestItem = async (
  actor: StoredDocument<Actor> | undefined,
  type: string,
  name: string = `New Actor Test ${type.capitalize()}`,
  data: object = {}
) => actor?.createEmbeddedDocuments("Item", [{ type, name, ...data }]);

export const createMockMacro = async () =>
  Macro.create({
    name: `Mock Macro ${foundry.utils.randomID()}`,
    type: "script",
    command: "console.log('Testing Macro');",
  });

export const createMockScene = async () =>
  Scene.create({ name: "Mock Scene", tokenVision: true });

export const getMockActorKey = async (key: string) =>
  game.actors?.getName(`Test Actor ${key}`);

/**
 * CLEANUP HELPERS
 */

export const cleanUpMacros = async () => {
  const mockMacros = game.macros?.filter((o) => o.name?.includes("Mock Macro"));
  mockMacros?.forEach(async (o) => await o.delete());
  return true;
};

export const cleanUpActorsByKey = async (key: string) => {
  game.actors
    ?.filter((a) => a.name === `Test Actor ${key}`)
    .forEach(async (a) => await a.delete());
};

export const cleanUpWorldItems = async () => {
  game.items
    ?.filter((a) => a?.name?.includes("New World Test"))
    .forEach(async (a) => await a.delete());
};

export const cleanUpScenes = async () => {
  game.scenes
    ?.filter((s) => s.name === "Mock Scene")
    .forEach(async (s) => await s.delete());
};

/**
 * CONSTS
 */
export const itemTypes = new Set([
  "spell",
  "ability",
  "armor",
  "weapon",
  "item",
  "container",
]);
