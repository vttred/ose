import { createOseMacro } from '../../macros';
import { trashChat, waitForInput } from '../../../e2e/testUtils';


export const key = 'ose.actor.macro';
export const options = {
    displayName: 'The Character Sheet: Item Macros'
};

export default ({ before, beforeEach, after, describe, it, expect, assert, ...context }) => {
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
    const trashActor = () => testActor()?.delete();
    const trashMacro = async () => {
        await game.macros.find(o => o.name === "Test Macro Item")?.delete();
        await game.user.assignHotbarMacro(null, 1);
    }
    const createItem = (type) => { return testActor()?.createEmbeddedDocuments("Item", [{ type: type, name: "Test Macro Item" }]) };

    const createItemMacroData = (item) => {
        const dragData = item.toDragData();
        dragData.item = item;
        dragData.type = "Item"
        return dragData
    };

    const canCreate = async (type) => {
        await createItem(type);
        const item = testActor().items.contents[0];
        const data = createItemMacroData(item);
        const macro = await createOseMacro(data, 1);
        await waitForInput();

        const createdMacro = game.user.getHotbarMacros()[0];
        expect(createdMacro?.macro?.command.indexOf("game.ose.rollItemMacro")).not.equal(-1)
    }

    before(async () => {
        await trashChat();
    })

    describe('Item Macro', () => {
        before(async () => {
            await prepareActor();
            trashMacro();
        })

        after(async () => {
            await trashChat();
            await trashActor();
        })

        afterEach(() => {
            trashMacro();
        })

        it('Create weapon macro', async () => { await canCreate("weapon") })
        it('Create spell macro', async () => { await canCreate("spell") })
    })
};