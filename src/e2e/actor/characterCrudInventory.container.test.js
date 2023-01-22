import { ExitStatus } from "typescript";
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

    // Test helpers

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
        it('Creating a container item on the Actor', async () => {
            expect(testActor().items.size).equals(0);
            const test_item = await createActorTestItem("container");
            expect(testActor().items.size).equals(1);
            expect(test_item.length).equals(1)
            expect(test_item[0].name).equals("New Actor Test Container")
        })
        it('Adding item from the actor itself into Actor container', async () => {
            expect(testActor().items.size).equals(0);
            await createActorTestItem("item");
            await createActorTestItem("container");
            expect(testActor().items.size).equals(2);
            expect(testActor().system.containers.length).equal(1);
            expect(testActor().system.items.length).equal(1);

            const test_item = testActor().items.getName("New Actor Test Item");
            const test_container = testActor().items.getName("New Actor Test Container");
            await testActorSheet()._onContainerItemAdd(test_item, test_container);

            expect(test_item.system.containerId).equals(test_container._id)
            expect(test_container.system.itemIds.length).equals(1)
            expect(test_container.system.itemIds[0]).equals(test_item._id)
            expect(testActor().system.containers.length).equal(1)
            expect(testActor().system.items.length).equal(0)            
        })
        // @fixes #265
        it('Adding item from Items sidebar into Actor container', async () => {
            expect(game.items.getName("New World Test Item")).equals(undefined)
            await createWorldTestItem('item');
            expect(game.items.getName("New World Test Item")).not.equals(undefined)
            await createActorTestItem("container");
            expect(testActor().items.size).equals(1);
            expect(testActor().system.containers.length).equal(1);

            const test_item = game.items.getName("New World Test Item");
            const test_container = testActor().items.getName("New Actor Test Container");
            await testActorSheet()._onContainerItemAdd(test_item, test_container);

            const test_item_actor = testActor().items.getName("New World Test Item");
            expect(test_item_actor.system.containerId).equals(test_container._id)
            expect(test_container.system.itemIds.length).equals(1)
            expect(test_container.system.itemIds[0]).equals(test_item_actor._id)
            expect(testActor().system.containers.length).equal(1)
            expect(testActor().system.items.length).equal(0)
        })
        // @fixes #265
        it('Adding item from Item Compendium into Actor container', async () => {
            expect(game.packs.get('world.testcompendiumtest')).equal(undefined)
            const compendium = await createTestCompendium();
            expect(game.packs.get('world.compendiumtest')).not.equal(undefined)
            console.log(game.packs.get('world.compendiumtest').size)
            expect(game.packs.get('world.compendiumtest').size).equal(0)
           
            expect(game.items.getName("New World Test Item")).equals(undefined)
            await createWorldTestItem('item');
            expect(game.items.getName("New World Test Item")).not.equals(undefined)

            await game.packs.get('world.compendiumtest').importDocument(game.items.getName("New World Test Item"));
            expect(game.packs.get('world.compendiumtest').size).equal(1)

            const test_item = game.packs.get('world.compendiumtest').contents[0];
            expect(test_item).not.equal(undefined);

            await createActorTestItem("container");
            expect(testActor().items.size).equals(1);
            expect(testActor().system.containers.length).equal(1);

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
        /**
         * _removeItemFromActor
         *  - actor.updateEmbeddedDocuments("Item", [{_id: id, system: {} }])
         *  - actor.deleteEmbeddedDocuments("Item", [id])
         * _onDropItem
         *  - _onContainerItemRemove(item, containerId)
         *    - item.update({system: {itemIds: []} });
         */
        it('Trying to remove container with items asks for confirmation', () => {})
        it('Confirmed deletion pops contained items into inventory', () => {})
        it('Cancelled confirmation cancels leaves container & inventory as-is', () => {})
        it('Removing contained item updates containers internal id list', () => {})
        it('Dragging contained item into inventory again removes it from container', () => {
            // Item does exist in `actor.system.items`
            //           not exist in `container.system.itemIds`. 
            // `item.system.containerId` === ''
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