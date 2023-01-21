/**
 * Contains logic for migrating data between versions, This applies to everything in the world.
 * @returns {Promise}   A Promise that resolves once migration is done
 */
export const migrateWorld = async function() {
    const version = game.system.version;
    ui.notifications.info(game.i18n.format("OSE.migration.beginMigration", {version}), {permanent: true});

    const migrationData = {};

    // Migrate World Actors
    const actors = game.actors;

    for ( const actor of actors ) {
        try {
            const source = actor.toObject();
            const updateData = migrateActorData(source, {actorId: actor._id} );
            if ( !foundry.utils.isEmpty(updateData) ) {
                console.log(`Migrating Actor document ${actor.name}`);
                await actor.update(updateData);
            }
        } catch(err) {
            err.message = `Failed OSE System Migration for Actor ${actor.name}: ${err.message}`;
            console.log(err);
        }
    }

    // Set the migration as complete
    game.settings.set(game.system.id, "systemMigrationVersion", game.system.version)
    ui.notifications.info(game.i18n.format("OSE.migration.completeMigration", {version}), {permanent: true});
};

/* ------------------------------- */
/* Document Type Migration Helpers */
/* ------------------------------- */

/**
 * Migrate a single Actor document to implement latest data model changes.
 * 
 * @param {object} actor                The actor data object to update
 * @param {object} [migrationData ]     Additional data to perform the mitigation
 * @returns {object}                    The updateData to apply
 */
export const migrateActorData = function(actor, migrationData) {
    const updateData = {};

    // Migrate owned items
    if ( !actor.items ) return updateData;
    const items = actor.items.reduce((arr, i) => {
        // Migrate owned items
        const itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i;
        let itemUpdate = migrateItemData(itemData, migrationData);

        // Update the Owned Item
        if ( !foundry.utils.isEmpty(itemUpdate) ) {
            itemUpdate._id = itemData._id;
            arr.push(foundry.utils.expandObject(itemUpdate));
        }

        return arr;
    }, []);
    if ( items.length > 0 ) updateData.items = items;

    return updateData;
}


/**
 * Migrate a single item to implement latest data model changes
 * 
 * @param {object} item             Item data to migrate
 * @param {object} [migrationData]  Additional data to perform the migration
 * @returns {object}                The updateData to apply
 */

export function migrateItemData(item, migrationData) {
    const updateData = {};
    _migrateContainerItemIds(item, updateData, migrationData );

    return updateData;
}


/* ----------------------------- */
/* Low level migration functions */
/* ----------------------------- */

/**
 * Converts faulty itemIds, where itemIds stored objects instead of ids.
 * @param {object} document 
 * @param {object} updateData
 * @returns {object}
 * @private
 */
function _migrateContainerItemIds(document, updateData, {actorId}={}) {
    let itemIds = document?.system?.itemIds;
    let containerId = document?._id;
    
    if (actorId && itemIds) {
        const actor = game.actors.get(actorId);
        const containerItems = actor.items.reduce((arr, i) => {
            if ( i.system.containerId === containerId ) 
                arr.push(i._id);

            return arr;
        }, []);

        updateData.system = { itemIds: containerItems };
    }

    return updateData;
}