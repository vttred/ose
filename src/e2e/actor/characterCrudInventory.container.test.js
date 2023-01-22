import { trashChat, waitForInput } from "../testUtils";

/** 
 * @file Contains tests for containers in actor sheets
 */
export const key = 'ose.actor.crud.inventory.container'
export const options = {
    displayName: 'Actor CRUD: Inventory, Container'
};

export default ({before, after, afterEach, expect, describe, it, ...context}) => {
    const testCharacterName = 'Quench Test Character';
    const prepareActor = async (data) => {
        await trashChat();
        await trashActor();

        return Actor.create({
            ...data,
            name: testCharacterName,
            type: 'character'
        });
    };

    const testActor = () => game.actors.getName(testCharacterName);
    const testActorSheet = () => testActor()?.sheet;
    const trashActor = () => testActor()?.delete();
    const trashItems = () => {
        testActor()?.items?.forEach(o => o.delete())
        game.items.filter(o => o.name.indexOf("New World Test") >= 0).forEach(o => o.delete());
    };
    const renderInventory = async () => { 
        await testActor().sheet._render(true);
    }

    /* --------------------------------------- */

    const createActorTestItem = async (type) => {
        return testActor().createEmbeddedDocuments("Item", [{type: type, name: `New Actor Test ${type.capitalize()}`}], {});
    }

    const createWorldTestItem = async (type) => {
        return Item.create({type: type, name: `New World Test ${type.capitalize()}`});
    }

    const deleteWorldTestItem = async (type) => {
        return game.items.getName(`New World Test ${type.capitalize()}`).delete();
    }

    const createTestCompendium = async () => {
        return CompendiumCollection.createCompendium({
            id: 'world.compendiumtest',
            label: 'Compendium Test',
            name: 'compendiumtest',
            type: "Item"
        })
    }

    const deleteTestCompendium = async () => { return game.packs.get('world.compendiumtest')?.deleteCompendium() };

    /* --------------------------------------- */

    const testSetupContainerAndItem = async () => {
        await testAddContainerAndItem();
        const sourceItem = testActor().items.getName("New Actor Test Item");
        const targetItem = testActor().items.getName("New Actor Test Container");
        await testMoveItemToContainer(sourceItem, targetItem)
        expect(testActor().items.size).equals(2);
        expect(testActor().system.containers.length).equal(1);
        expect(testActor().system.items.length).equal(0);
    }

    /* --------------------------------------- */

    const testAddContainerToActor = async () => {
        expect(testActor().items.size).equals(0);
        const test_item = await createActorTestItem("container");
        expect(testActor().items.size).equals(1);
        expect(test_item.length).equals(1)
        expect(test_item[0].name).equals("New Actor Test Container")
        expect(testActor().system.containers.length).equal(1);
    }

    const testAddContainerAndItem = async () => {
        await testAddContainerToActor();
        await createActorTestItem("item");
        expect(testActor().items.size).equals(2);
        expect(testActor().system.items.length).equal(1);
    }

    const testAddWorldItem = async () => {
        expect(game.items.getName("New World Test Item")).equals(undefined)
        await createWorldTestItem('item');
        const test_item = game.items.getName("New World Test Item");
        expect(test_item).not.equals(undefined)
        return test_item;
    }

    /* --------------------------------------- */

    const testMoveItemToContainer = async (sourceItem, targetItem) => {
        await testActorSheet()._onContainerItemAdd(sourceItem, targetItem);
        
        expect(sourceItem.system.containerId).equals(targetItem._id)
        expect(targetItem.system.itemIds.length).equals(1)
        expect(targetItem.system.itemIds[0]).equals(sourceItem._id)
        expect(testActor().system.containers.length).equal(1)
        expect(testActor().system.items.length).equal(0)
    }

    /* --------------------------------------- */

    before(async () => {
        await trashChat();
        await prepareActor();
    })

    after(async () => {
        await trashChat();
        await trashActor();
    })

    afterEach(async () => {
        trashItems();
        await deleteTestCompendium();
        await waitForInput();
    })

    /* --------------------------------------- */

    describe('Creating', () => {
        it('Creating a container item on the Actor', async () => { await testAddContainerToActor(); })
        it('Adding item from the actor itself into Actor container', async () => { await testAddContainerAndItem(); })
        it('Adding item from Items sidebar into Actor container', async () => {
            const test_item = await testAddWorldItem();

            await testAddContainerToActor();

            const test_container = testActor().items.getName("New Actor Test Container");
            await testActorSheet()._onContainerItemAdd(test_item, test_container);

            const test_item_actor = testActor().items.getName("New World Test Item");
            expect(test_item_actor.system.containerId).equals(test_container._id)
            expect(test_container.system.itemIds.length).equals(1)
            expect(test_container.system.itemIds[0]).equals(test_item_actor._id)
            expect(testActor().system.containers.length).equal(1)
            expect(testActor().system.items.length).equal(0)
        })
        it('Adding item from Item Compendium into Actor container', async () => {
            expect(game.packs.get('world.testcompendiumtest')).equal(undefined)
            const compendium = await createTestCompendium();
            expect(game.packs.get('world.compendiumtest')).not.equal(undefined)
            expect(game.packs.get('world.compendiumtest').size).equal(0)
           
            const test_world_item = await testAddWorldItem();

            await game.packs.get('world.compendiumtest').importDocument(test_world_item);
            expect(game.packs.get('world.compendiumtest').size).equal(1)

            const test_item = game.packs.get('world.compendiumtest').contents[0];
            expect(test_item).not.equal(undefined);

            await testAddContainerToActor()
            const test_container = testActor().items.getName("New Actor Test Container");
            await testActorSheet()._onContainerItemAdd(test_item, test_container);

            const test_item_actor = testActor().items.getName("New World Test Item");
            expect(test_item_actor.system.containerId).equals(test_container._id)
            expect(test_container.system.itemIds.length).equals(1)
            expect(test_container.system.itemIds[0]).equals(test_item_actor._id)
            expect(testActor().system.containers.length).equal(1)
            expect(testActor().system.items.length).equal(0)
        })
    })

    describe('Removing', () => {
        beforeEach(async () => {
            await testSetupContainerAndItem()
        })

        // it('Trying to remove container with items asks for confirmation', () => {})
        // it('Confirmed deletion pops contained items into inventory', () => {})
        // it('Cancelled confirmation cancels leaves container & inventory as-is', () => {})
        it('Removing contained item updates containers internal id list', async () => {
            const test_item = testActor().items.getName("New Actor Test Item");
            const test_container = testActor().items.getName("New Actor Test Container");
            expect(test_item).not.equal(undefined)
            expect(test_container).not.equal(undefined)

            await testActorSheet()._removeItemFromActor(test_item);
            await waitForInput();
            expect(testActor().system.containers.length).equal(1)
            expect(test_container.system.itemIds.length).equal(0)
            expect(testActor().system.items.length).equal(0)
        })
        it('Dragging contained item into inventory again removes it from container', async () => {
            const test_item = testActor().items.getName("New Actor Test Item");
            const test_container = testActor().items.getName("New Actor Test Container");
            expect(test_item).not.equal(undefined)
            expect(test_container).not.equal(undefined)

            await testActorSheet()._onContainerItemRemove(test_item, test_container);
            await waitForInput();
            expect(testActor().system.containers.length).equal(1)
            expect(test_container.system.itemIds.length).equal(0)
            expect(testActor().system.items.length).equal(1)
            expect(test_item.system.containerId).equal('')
        })
    })
    // describe('Updating', () => {
    //     it('Updating the container description shows up in actor sheet', () => {})
    // })
    // describe('Displaying', () => {
    //     it('Clicking on an item in inventory expands to show summary', () => {})
    //     it('Clicking the container icon displays container & its contents to chat', () => {})
    // })

}