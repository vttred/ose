import { createOseMacro } from '../../module/macros';
import { trashChat, waitForInput } from '../testUtils';


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
    const trashMacro = () => (game.macros.size)
        ? game.macros.documentClass.deleteDocuments([], { deleteAll: true })
        : null;
    const createItem = async (type) => { return testActor()?.createEmbeddedDocuments("Item", [{ 'type': type, 'name': `Test ${type}` }]) };

    const createItemMacroData = (item) => {
        const dragData = item.toDragData();
        dragData.item = item;
        dragData.type = "Item"
        return dragData
    };

    const checkMacroCreation = (slot) => {
        const macro = game.user.getHotbarMacros()[slot];
        return (macro.macro?.command?.indexOf("game.ose.rollItemMacro") >= 0)
    };

    const canCreate = async("type") => {
        expect(game.macros.size).equal(0)
        await createItem(type);
        const item = testActor().items.contents[0];
        const data = createItemMacroData(item);
        const macro = await createOseMacro(data, 1);
        await waitForInput();
        expect(game.macros.size).equal(1)
        const macroCheck = checkMacroCreation(0);
        assert(checkMacroCreation(0))
    }

    before(async () => {
        await trashChat();
    })

    describe('Item Macro', () => {
        before(async () => {
            await prepareActor();
            await trashMacro();
        })

        after(async () => {
            await trashChat();
            await trashActor();
        })

        afterEach(async () => {
            await trashMacro();
        })

        it('Create spell macro', () => { canCreate("weapon") })
        it('Create spell macro', () => { canCreate("spell") })
    })
};