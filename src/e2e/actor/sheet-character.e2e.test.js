/**
 * @file Tests for the Character sheet
 */
import { trashChat, waitForInput } from "../testUtils";

export const key = "ose.sheet.actor.character";
export const options = {
  displayName: "Sheet: Character",
};

/**
 * If there are dialogs, close them.
 *
 * @returns {Promise} the promise from closing dialogs
 */
export const closeRollDialog = async () => {
  const openDialogs = Object.values(ui.windows).filter((o) =>
    o.options.classes.includes("dialog")
  );

  openDialogs?.forEach(async (o) => {
    await o.close();
  });
};

export default ({
  before,
  beforeEach,
  after,
  afterEach,
  describe,
  it,
  expect,
  ...context
}) => {
  const testCharacterName = "Quench Test Character";
  const prepareActor = async (data) => {
    await trashChat();
    await trashActor();

    return Actor.create({
      ...data,
      name: testCharacterName,
      type: "character",
    });
  };

  const testActor = () => game.actors.getName(testCharacterName);
  const trashActor = () => testActor()?.delete();

  const rollNoMods = async (key, rollFn) => {
    await testActor()[rollFn](key, { fastForward: true });
    await waitForInput();
    expect(game.messages.size).to.equal(1);
  };

  const rollNoModsSkipDialog = async (key, rollFn) => {
    const ctrl_down = new KeyboardEvent("keydown", { ctrlKey: true });
    await testActor()[rollFn](key, { event: ctrl_down });
    await waitForInput();
    expect(game.messages.size).to.equal(1);
  };

  const rollNoModsSkipDialogMeta = async (key, rollFn) => {
    const meta_down = new KeyboardEvent("keydown", { metaKey: true });
    await testActor()[rollFn](key, { event: meta_down });
    await waitForInput();
    expect(game.messages.size).to.equal(1);
  };

  const rollMods = async (key, rollFn) => {
    testActor()[rollFn](key);

    await waitForInput();

    const dialog = document.querySelector(".roll-dialog.ose");
    dialog.querySelector('[name="bonus"]').value = 20;
    dialog
      .closest(".window-content")
      .querySelector(".dialog-button.ok")
      .click();

    await waitForInput();

    expect(game.messages.size).to.equal(1);
  };

  const rollInvertCtrlNoDialog = async (key, rollFn) => {
    await testActor()[rollFn](key, { fastForward: false });
    await waitForInput();

    expect(game.messages.size).to.equal(1);
  };

  const rollInvertCtrlDialog = async (key, rollFn) => {
    const ctrl_down = new KeyboardEvent("keydown", { ctrlKey: true });
    testActor()[rollFn](key, { event: ctrl_down });

    await waitForInput();

    const dialog = document.querySelector(".roll-dialog.ose");
    expect(dialog).not.equal(null);

    dialog
      .closest(".window-content")
      .querySelector(".dialog-button.ok")
      .click();

    await waitForInput();
    expect(game.messages.size).to.equal(1);
  };

  const rollInvertCtrlDialogMeta = async (key, rollFn) => {
    const meta_down = new KeyboardEvent("keydown", { metaKey: true });
    testActor()[rollFn](key, { event: meta_down });

    await waitForInput();

    const dialog = document.querySelector(".roll-dialog.ose");
    expect(dialog).not.equal(null);

    dialog
      .closest(".window-content")
      .querySelector(".dialog-button.ok")
      .click();

    await waitForInput();
    expect(game.messages.size).to.equal(1);
  };

  const canRoll = (key, rollFn) => {
    before(async () => {
      await game.settings.set(game.system.id, "invertedCtrlBehavior", false);
    });

    beforeEach(async () => {
      await trashChat();
    });

    afterEach(async () => {
      await closeRollDialog();
    });
    it("With no modifiers", async () => {
      await rollNoMods(key, rollFn);
    });
    it("Skipping dialog, holding ctrl", async () => {
      await rollNoModsSkipDialog(key, rollFn);
    });
    it("Skipping dialog, holding meta", async () => {
      await rollNoModsSkipDialogMeta(key, rollFn);
    });
    it("With modifiers", async () => {
      await rollMods(key, rollFn);
    });

    describe("Inverted Ctrl behavior", () => {
      before(async () => {
        await game.settings.set(game.system.id, "invertedCtrlBehavior", true);
      });

      after(async () => {
        await game.settings.set(game.system.id, "invertedCtrlBehavior", false);
      });

      it("Inverted ctrl behavior without dialog", async () => {
        await rollInvertCtrlNoDialog(key, rollFn);
      });
      it("Inverted ctrl behavior with dialog, ctrl key", async () => {
        await rollInvertCtrlDialog(key, rollFn);
      });
      it("Inverted ctrl behavior with dialog, meta key", async () => {
        await rollInvertCtrlDialogMeta(key, rollFn);
      });
    });
  };

  before(async () => {
    await trashChat();
  });

  // Ut02
  describe("Sanity Checks", () => {
    beforeEach(async () => {
      await prepareActor();
    });

    it("renders", async () => {
      await testActor().sheet._render(true);
      expect(document.querySelector(".sheet.character")).not.to.be.null;
      await testActor().sheet.close();
    });
  });

  describe("The Attributes Tab", () => {
    // At01
    describe("Scores", () => {
      const canRollCheck = (key) => canRoll(key, "rollCheck");

      before(async () => {
        await prepareActor();
      });

      after(async () => {
        await trashChat();
        await trashActor();
      });

      describe("Strength", () => {
        describe("Can roll", () => canRollCheck("str"));
      });

      describe("Intelligence", () => {
        describe("Can roll", () => canRollCheck("int"));
      });

      describe("Wisdom", () => {
        describe("Can roll", () => canRollCheck("wis"));
      });

      describe("Dexterity", () => {
        describe("Can roll", () => canRollCheck("dex"));
      });

      describe("Constitution", () => {
        describe("Can roll", () => canRollCheck("con"));
      });

      describe("Charisma", () => {
        describe("Can roll", () => canRollCheck("cha"));
      });
    });

    // At02
    describe("Saves", () => {
      const canRollSave = (key) => canRoll(key, "rollSave");

      before(async () => {
        await prepareActor();
      });

      after(async () => {
        await trashChat();
      });

      describe("Death/Poison", () => {
        describe("Can roll", () => canRollSave("death"));
      });

      describe("Wands", () => {
        describe("Can roll", () => canRollSave("wand"));
      });

      describe("Paralysis/Petrify", () => {
        describe("Can roll", () => canRollSave("paralysis"));
      });

      describe("Breath Attacks", () => {
        describe("Can roll", () => canRollSave("breath"));
      });

      describe("Spells/Rods/Staves", () => {
        describe("Can roll", () => canRollSave("spell"));
      });
    });
  });

  describe("The Abilities Tab", () => {
    // Ab01
    describe("Exploration Skills", () => {
      const canRollExploration = (key) => canRoll(key, "rollExploration");

      before(async () => {
        await prepareActor();
      });

      after(async () => {
        await trashChat();
      });

      describe("Listen Door", () => {
        describe("Can roll", () => canRollExploration("ld"));
      });

      describe("Open Door", () => {
        describe("Can roll", () => canRollExploration("od"));
      });

      describe("Find Secret Doors", () => {
        describe("Can roll", () => canRollExploration("sd"));
      });

      describe("Find Traps", () => {
        describe("Can roll", () => canRollExploration("ft"));
      });
    });

    // // Ab02
    // describe('Ability CRUD', () => {
    //   it('Create an ability on the actor', () => {})
    //   it('Display an ability\'s description from the Abilities tab', () => {})
    //   it('Open an actor\'s owned ability\'s sheet', () => {})
    //   it('Delete an actor\'s owned ability', () => {})
    // });
  });

  // describe('The Inventory Tab', () => {
  //   const clearItems = async () => await testActor().items.clear();
  //   const setUpInventory = async () => {
  //     await testActor().sheet._render(true);
  //     document.querySelector('.sheet.character .tabs .item[data-tab="inventory"]').click();
  //     return waitForInput();
  //   }
  //   const tearDown = async () => {
  //     await clearItems();
  //     return testActor().sheet.close();
  //   }

  //   // In01
  //   describe('Weapon CRUD', () => {
  //     before(async () => {
  //       await setUpInventory();
  //     });
  //     after(async () => {
  //       await tearDown();
  //     });
  //     it('Create a weapon on the actor', () => {})
  //     it('Display a weapon\'s description from the Inventory tab', () => {})
  //     it('Equip an actor\'s owned weapon', () => {})
  //     it('Open an actor\'s owned weapon\'s sheet', () => {})
  //     it('Delete an actor\'s owned weapon', () => {})
  //   });

  //   // In02
  //   describe('Armor CRUD', () => {
  //     it('Create armor on the actor', () => {})
  //     it('Display an armor item\'s description from the Inventory tab', () => {})
  //     it('Equip an actor\'s owned armor', () => {})
  //     it('Open an actor\'s owned armor\'s sheet', () => {})
  //     it('Delete an actor\'s owned armor', () => {})
  //   });

  //   // In03
  //   describe('Container CRUD', () => {
  //     it('Create a container on the actor', () => {})
  //     it('Display a container\'s description from the Inventory tab', () => {})
  //     it('Open an actor\'s owned container\'s sheet', () => {})
  //     it('Delete an actor\'s owned container', () => {})
  //   });

  //   // In04
  //   describe('Misc. CRUD', () => {
  //     it('Create an item on the actor', () => {})
  //     it('Display an item\'s description from the Inventory tab', () => {})
  //     it('Open an actor\'s owned item\'s sheet', () => {})
  //     it('Delete an actor\'s owned item', () => {})
  //   });

  //   // In05
  //   describe('Treasure CRUD', () => {
  //     it('Create a treasure item on the actor', () => {})
  //     it('Display a treasure item\'s description from the Inventory tab', () => {})
  //     it('Open an actor\'s owned treasure item\'s sheet', () => {})
  //     it('Delete an actor\'s owned treasure item', () => {})
  //   });

  //   // In06
  //   describe('Encumbrance', () => {
  //     it('TODO: How to test each encumbrance method?', () => {})
  //   })
  // });

  // describe('The Spells Tab', () => {
  //   beforeEach(async () => {
  //     // await prepareActor();
  //   });

  //   afterEach(async () => {
  //     await trashChat();
  //     await trashActor();
  //   });

  //   it('is not enabled when the character is not a spellcaster', async () => {
  //     await prepareActor();

  //     await testActor().sheet._render(true);

  //     const tabButton = document.querySelector('.item[data-tab="spells"]');
  //     const tabContainer = document.querySelector('.tab[data-tab="spells"]');

  //     expect(tabContainer).to.be.null;
  //     expect(tabButton).to.be.null;

  //     await testActor().sheet.close();
  //   })

  //   it('is enabled when the character is a spellcaster', async () => {
  //     await prepareActor({
  //       system: {
  //         spells: {
  //           enabled: true
  //         }
  //       }
  //     });

  //     await testActor().sheet._render(true);

  //     const tabButton = document.querySelector('.item[data-tab="spells"]');
  //     const tabContainer = document.querySelector('.tab[data-tab="spells"]');

  //     expect(tabContainer).not.to.be.null;
  //     expect(tabButton).not.to.be.null;

  //     tabButton.click();

  //     expect(tabContainer.classList.contains('active')).to.be.true;

  //     await testActor().sheet.close();
  //   })
  // });

  // describe('The Notes Tab', () => {
  //   // No01
  //   describe('Languages', () => {
  //     it('Open the language dialog', () => {});
  //     it('Add a language to the actor from the language dialog', () => {});
  //     it('Delete one of the actor\'s languages', () => {});
  //   })

  //   // No02
  //   describe('Notes and Bio', () => {
  //     it('Render the Bio', () => {});
  //     it('Render the Notes', () => {});
  //   })

  // });

  after(async () => {
    await trashActor();
  });
};
