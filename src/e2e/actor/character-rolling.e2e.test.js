/**
 * @file Tests for the Character sheet
 */
import { trashChat, waitForInput } from "../testUtils";

export const key = "ose.actor.character.rolling";
export const options = {
  displayName: "Actor Data Model: Character Rolling",
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

export default ({ before, beforeEach, after, describe, it, expect }) => {
  const testCharacterName = "Quench Test Character";

  const testActor = () => game.actors.getName(testCharacterName);
  const trashActor = () => testActor()?.delete();

  const prepareActor = async (data) => {
    await trashChat();
    await trashActor();

    return Actor.create({
      ...data,
      name: testCharacterName,
      type: "character",
    });
  };

  const rollNoMods = async (rollKey, rollFn) => {
    await testActor()[rollFn](rollKey, { fastForward: true });
    await waitForInput();
    expect(game.messages.size).to.equal(1);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const rollNoModsSkipDialog = async (rollKey, rollFn) => {
    const ctrlDown = new KeyboardEvent("keydown", { ctrlKey: true });
    await testActor()[rollFn](rollKey, { event: ctrlDown });
    await waitForInput();
    expect(game.messages.size).to.equal(1);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const rollNoModsSkipDialogMeta = async (rollKey, rollFn) => {
    const metaDown = new KeyboardEvent("keydown", { metaKey: true });
    await testActor()[rollFn](rollKey, { event: metaDown });
    await waitForInput();
    expect(game.messages.size).to.equal(1);
  };

  const rollMods = async (rollKey, rollFn) => {
    testActor()[rollFn](rollKey);

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

  const canRoll = (rollKey, rollFn) => {
    beforeEach(async () => {
      await trashChat();
    });
    it("With no modifiers", async () => {
      await rollNoMods(rollKey, rollFn);
    });
    it("With modifiers", async () => {
      await rollMods(rollKey, rollFn);
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
      // eslint-disable-next-line no-underscore-dangle
      await testActor().sheet._render(true);
      expect(document.querySelector(".sheet.character")).not.to.be.null;
      await testActor().sheet.close();
    });
  });

  describe("The Attributes Tab", () => {
    // At01
    describe("Scores", () => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const canRollCheck = (rollKey) => canRoll(rollKey, "rollCheck");

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
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const canRollSave = (rollKey) => canRoll(rollKey, "rollSave");

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
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const canRollExploration = (rollKey) =>
        canRoll(rollKey, "rollExploration");

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
