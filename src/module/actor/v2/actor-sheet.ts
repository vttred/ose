/**
 * @file The base ActorSheet class for other Actor types.
 */
import OseItem from "../../item/entity";
import MajorIconField from '../../../components/MajorIconField/MajorIconField';
import OseActor from "../entity";

import OseEntityTweaks from "../../dialog/entity-tweaks";

import '../../../css/components.css';
import ItemRow from "../../../components/ItemRow/ItemRow";
import OSE from "../../config";

/**
 * The base actor sheet class that will accompany v2.0 of the system.
 * 
 * ---
 * # Phase 1
 * 
 * At this phase, we have feature parity between the v1 sheet and the v2 sheet.
 * 
 * @todo - Combat Tab: Hit die rolls
 * @todo - Inventory Tab: Zebra striping on item-rows
 * @todo - General: Drag to create hotbar macros
 * 
 * ---
 * # Phase 2
 * 
 * At this phase, the character sheet is stable enough to be the default sheet.
 * We can safely make bigger changes to underlying data (and propagate UI changes back to old sheets). 
 * 
 * @todo - Abilities Tab: Multiple ability buckets (class skills, special skills, etc)
 * @todo - Magic Tab: Spell Sources (spellbook, magic item effects, etc)
 * @todo - General: Active Effects UI
 * @todo - General: Allow module authors to override/add onto uft-item-row
 * @todo - General: HTML input fields handle changing focus with tab; how can we make custom elements do so too?
 */
export default class OseActorSheet extends ActorSheet {
  /**
   * @ignore This isn't useful until we can use custom elements for data entry
   */
  static get InputFields () {
    return [
      "uft-character-info-field", 
      "uft-character-ability-field", 
      "uft-major-icon-field", 
      "uft-spell-slot-field"
    ].join(",");
  }

  /**
   * Extend and override the default options used by the base Actor Sheet
   *
   * @returns - The default options for this sheet.
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      resizable: true,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
        },
      ],
      dragDrop: [
        {
          dragSelector: 'uft-expandable-section:not([type="container"]) uft-item-row',
          dropSelector: 'uft-expandable-section:not([type="container"]) uft-item-row',
          callbacks: {
            drop: 'onDropSort'
          }
        },
        {
          dragSelector: 'uft-expandable-section[type="container"] uft-tippable-item',
          dropSelector: 'uft-expandable-section[type="container"] uft-tippable-item',
          callbacks: {
            drop: 'onDropSort'
          }
        },
        {
          dragSelector: 'uft-expandable-section:not([type="container"]) uft-item-row',
          dropSelector: 'uft-expandable-section[type="container"] :is(uft-item-row, uft-item-row > *)',
          callbacks: {
            drop: 'onDropIntoContainer'
          }
        }, 
        {
          dragSelector: 'uft-item-row uft-tippable-item',
          dropSelector: 'uft-expandable-section[type="container"]',
          callbacks: {
            drop: 'onDropIntoContainer'
          }
        },
        {
          dragSelector: 'uft-item-row uft-tippable-item',
          dropSelector: 'uft-expandable-section:not([type="container"])',
          callbacks: {
            drop: 'onDropOutsideContainer'
          }
        },
        {
          dragSelector: 'uft-item-row',
          dropSelector: 'uft-prepared-spells',
          callbacks: {
            drop: 'onPrepareSpellViaDrop'
          }
        },
        {
          dropSelector: '.window-content',
          callbacks: {
            drop: '_onDrop'
          }
        },
      ]
      // filter: [{inputSelector: 'input[name="inventory-search"]', contentSelector: "[data-tab='inventory'] inventory-row"}]
    });
  }

  /**
   * 
   */
  get favoriteItems() {
    const itemIds = (this.actor.getFlag(game.system.id, "favorite-items") ||
      []) as string[];
    return itemIds
      .map((id: string) => fromUuidSync(id) as Item)
  }

  /**
   * The enriched notes text, with document links and other enrichments applied
   * @returns The enriched text, in a Promise
   */
  get enrichedNotes(): Promise<string> {
    return TextEditor.enrichHTML(
      // @ts-expect-error - Document.system isn't in the types package yet
      this.actor.system.details.notes,
      { async: true }
    ) as Promise<string>;
  }

  /**
   * @ignore This isn't useful until we can use custom elements for data entry
   * 
   * @param e The submit event
   * @param options Submit options for the character sheet.
   * 
   * @override
   * @returns 
   */
  // eslint-disable-next-line no-underscore-dangle
  _onSubmit(e: Event, options?: FormApplication.OnSubmitOptions ): Promise<Partial<Record<string, unknown>>> {
    let updateData: Record<string, unknown> = {...options?.updateData};
    const target = (e.target as MajorIconField | null);

    // Some custom elements can hold multiple values.
    // When they see a change, they pass along the name
    // of the target system field, as well, so we can
    // force the updated data into the update flow.
    if (target?.targetName && updateData) {
      updateData[target.targetName] = parseInt(target.value, 10);
    }
    
    // eslint-disable-next-line no-underscore-dangle
    return super._onSubmit(e, {...options, updateData});
  }


  /**
   * Create drag-and-drop workflow handlers for this Application
   * 
   * @override
   * @returns {DragDrop[]}     An array of DragDrop handlers
   */
  _createDragDropHandlers() {
    return this.options.dragDrop.map( (d: DragDropConfiguration) => {
      const setCallback = (key: "dragstart"|"dragover"|"drop", defaultValue: unknown) => {
        const value: string | unknown = d?.callbacks?.[key];
        if (value) {
          if (
            typeof value === 'string' && 
            // @ts-expect-error - String cannot index to this class
            typeof (this[value] as unknown) === 'function'
          )
            // @ts-expect-error - String cannot index to this class
            return this[value].bind(this);
          if (typeof value === 'function')
            return value.bind(this);
        }
        return defaultValue;
      }

      return new DragDrop({
        ...d,
        callbacks: {
          ...d.callbacks,
          dragstart: setCallback('dragstart', this._onDragStart.bind(this)),
          dragover: setCallback('dragover', this._onDragOver.bind(this)),
          drop: setCallback('drop', this._onDrop.bind(this)),
        }
      });
    });
  }

  /**
   * 
   * @param e 
   * @returns 
   */
  async onDropSort(e: DragEvent) {
    const dragData = JSON.parse(e?.dataTransfer?.getData("text/plain") || '{type: null, uuid: null}'); 
    if (dragData.type !== "Item") return;

    let itemToMove = await fromUuid(dragData.uuid) as OseItem | null;
    const itemToDisplace = await fromUuid(
      (e.target as HTMLElement | null)?.closest("[uuid]")?.getAttribute("uuid") || ''
    ) as OseItem | null;

    // If either item doesn't exist, bail,
    if (!itemToMove || !itemToDisplace) return;
    if (itemToMove.parent?.uuid !== this.actor.uuid) return;
    if (itemToDisplace.parent?.uuid !== this.actor.uuid) return;
    
    // If we're not dealing with contained items and the item types don't match, bail
    if (
      // @ts-expect-error - OseItem.system exists!
      (!itemToMove.system.containerId || !itemToDisplace.system.containerId) &&
      itemToMove.type !== itemToDisplace.type
    ) return;

    const isSortingInContainer = (
      // @ts-expect-error - Types package doesn't include system prop 
      itemToMove?.system.containerId &&
      // @ts-expect-error - Types package doesn't include system prop 
      itemToDisplace?.system.containerId &&
      // @ts-expect-error - Types package doesn't include system prop 
      itemToMove?.system.containerId === itemToDisplace?.system.containerId
    );

    this.sortItems(
      itemToMove,
      itemToDisplace,
      (e.target as HTMLElement)
        ?.closest(isSortingInContainer ? "uft-item-row" : "uft-expandable-section[type]")
        ?.querySelectorAll(`[uuid]:not([uuid="${itemToMove.uuid}"])`),
    );
  }

  /**
   * 
   * @param e 
   * @returns 
   */
  async onDropIntoContainer(e: DragEvent) {
    e.stopPropagation();
    const dragData = JSON.parse(e?.dataTransfer?.getData("text/plain") || '{type: null, uuid: null}'); 
    if (dragData.type !== "Item") return;

    let itemToContain = await fromUuid(dragData.uuid) as OseItem | null;
    const container = await fromUuid(
      (e.target as HTMLElement | null)?.closest("[uuid]")?.getAttribute("uuid") || ''
    ) as OseItem | null;

    if (
      !itemToContain ||
      !container ||
      container?.type !== "container"
    ) return;

    // Sort containers among other containers
    if (itemToContain?.type === "container") {
      this.sortItems(
        itemToContain,
        container,
        (e.target as HTMLElement)?.closest("uft-expandable-section[type]")
          ?.querySelectorAll(`uft-item-row[uuid]:not([uuid="${itemToContain.uuid}"])`),
      );
      return; 
    }

    if (!itemToContain?.actor?.uuid || itemToContain.actor.uuid !== this.actor.uuid) {
      itemToContain = (await this.actor.createEmbeddedDocuments("Item", [itemToContain.toObject()]))[0] as OseItem;
    }

    itemToContain.update({
      'system.containerId': container.id
    })
  }
  
  /**
   * 
   * @param e 
   * @returns 
   */
  async onDropOutsideContainer(e: DragEvent) {
    e.stopPropagation();

    const dragData = JSON.parse(
      e?.dataTransfer?.getData("text/plain") ||
      '{type: null, uuid: null}'
    );
    
    if (dragData.type !== "Item")
      return this._onDrop(e);

    const droppedItem = await fromUuid(dragData.uuid) as OseItem;

    if (droppedItem.type === 'spell' || droppedItem.type === 'ability')
      return this._onDrop(e);
    if (dragData.fromContainer)
      return droppedItem?.update({ "system.containerId": "" });
    if (droppedItem?.type === "container")
      return this.onMoveContainerToAnotherActor(droppedItem);
    
    return this._onDrop(e);
  }

  
  
  /**
   * 
   * @param e 
   */
  async _onDrop(e: DragEvent) {
    // @ts-expect-error - Types package considers TextEditor.getDragEventData protected 
    const data = TextEditor.getDragEventData(e) as OseItem;
    const dropped = await fromUuid(data?.uuid) as OseItem;
    const droppedSource = dropped?.getFlag('core', 'sourceId');
    const itemToIncrement = this.actor.items.find(i => i.getFlag('core', 'sourceId') === droppedSource );

    if (
      // The dropped item is from an actor that is this actor
      dropped?.parent?.uuid === this.actor.uuid ||
      // The incrementing item isn't an item (gear or treasure)
      itemToIncrement?.type !== 'item' ||
      // The dropped item doesn't have quantity to distribute
      // @ts-expect-error - Types package doesn't include system prop 
      !dropped?.system.quantity.value
    )
      super._onDrop(e);
    else {
      const templateData = {
        item: dropped,
        recipient: this.actor,
        donor: dropped.parent
      };
      const shareDialogBody = await renderTemplate(
        `${OSE.systemPath()}/templates/actors/dialogs/transfer-stacked-item.hbs`,
        templateData
      );
      // Create Dialog window
      new Dialog(
        {
          title: game.i18n.format("OSE.dialog.transferItem.title", {
            itemName: dropped.name,
            recipientName: this.actor.name
          }),
          content: shareDialogBody,
          buttons: {
            ok: {
              label: game.i18n.localize("OSE.Ok"),
              icon: '<i class="fas fa-check"></i>',
              callback: (html) => {
                // @ts-expect-error - html.find works, this is a jQuery object 
                const quantity = parseInt(html.find('input[name="quantity"]').val() || 0, 10);
                // @ts-expect-error - html.find works, this is a jQuery object 
                const shouldSubtract = html.find('input[name="shouldSubtract"]').is(':checked');
      
                itemToIncrement?.update({
                  // @ts-expect-error - Types package doesn't include system prop 
                  'system.quantity.value': itemToIncrement.system.quantity.value + quantity
                })
                if (shouldSubtract)
                  dropped?.update({
                    // @ts-expect-error - Types package doesn't include system prop 
                    'system.quantity.value': dropped.system.quantity.value - quantity
                  })


                
              },
            },
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: game.i18n.localize("OSE.Cancel"),
            },
          },
          default: "ok",
        },
        {
          width: 250,
        }
      ).render(true);
    }
  }

  /**
   * 
   * @param droppedItem 
   */
  async onMoveContainerToAnotherActor(droppedItem: OseItem) {
    const containerItemObj = droppedItem.toObject();

    if (droppedItem?.parent?.uuid === this.actor.uuid)
      return;

    const [createdContainer] = await this.actor.createEmbeddedDocuments("Item", [containerItemObj]);

    // @ts-expect-error - OseItem.system exists!
    await this.actor.createEmbeddedDocuments("Item", droppedItem.system.contents.map((i: OseItem) => {
      const item = i.toObject();
      // @ts-expect-error - OseItem.system exists!
      item.system.containerId = createdContainer.id;
      return item;
    }));
  }

  /**
   * 
   * @param e 
   * @returns 
   */
  async onPrepareSpellViaDrop(e: DragEvent) {
    const dragData = JSON.parse(
      e?.dataTransfer?.getData("text/plain") ||
      '{type: null, uuid: null}'
    );
    if (!dragData.type)
      return;
    const spell = await fromUuid(dragData.uuid) as OseItem;
    if (spell?.type !== 'spell')
      return;
    if (spell.parent?.uuid !== this.actor.uuid)
      return;
    // @ts-expect-error - Types package doesn't include system prop 
    const maxAtLevel = this.actor.system.spells.slots[spell.system.lvl].max;
    // @ts-expect-error - Types package doesn't include system prop 
    const updatedUsedAtLevel = this.actor.system.spells.slots[spell.system.lvl].used + 1;
    // @ts-expect-error - Types package doesn't include system prop 
    const newValue = spell.system.cast + 1;
    
    if (updatedUsedAtLevel > maxAtLevel)
      return null;

    return await spell.update({
      'system.cast': newValue
    });
  }

  /**
   * Sort OseItems -- abilities, containers, items, or spells.
   * @param item - The item we're sorting 
   * @param target - The item we dragged an item onto
   * @param nodesToDisplace - HTML elements representing the siblings of the item we're sorting
   * @returns - 
   */
  protected async sortItems (
    item: OseItem,
    target: OseItem,
    nodesToDisplace: NodeListOf<HTMLElement> | never[] = []
  ) {
    if (!item) return [];
    
    const siblings = await Promise.all(
      Array.from(nodesToDisplace)?.map(
        (n: HTMLElement) => fromUuid(n.getAttribute("uuid") || '')
      )
    );

    return Promise.all(
      SortingHelpers
        .performIntegerSort(item, { target, siblings })
        .map(
          ({target, update}) => target?.update(update)
        )
    );
  }

  /**
   * 
   * @param e 
   * @returns 
   */
  async #onCreateItemOfType(e: Event) {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const type = target?.getAttribute("type");
    if (!type) return;

    const itemToCreate = { type, name: `New ${type.capitalize()}` }    
    const system : Record<string, unknown> = target
      .getAttributeNames()
      .filter(a => a.startsWith("data-"))
      .reduce((prev, curr) => {
        const attrName = curr.replace('data-', '').replace(/-([a-z])/g, g => g[1].toUpperCase());
        return {
          ...prev,
          [attrName]: target.getAttribute(curr) || true
        }
      }, {});

    await this.actor.createEmbeddedDocuments("Item", [{...itemToCreate, system }])
  }

  /**
   * 
   * @param event 
   */
  #rollSave(event: Event) {
    event.preventDefault();
    const save = (event?.target as HTMLElement)
      ?.closest('uft-labeled-section')
      ?.querySelector('input[name]')
      ?.getAttribute("name")
      ?.split(".")[2];
    // We can use this when uft-ability-score-field is usable
    // const save = (event.target as HTMLElement).getAttribute("name")?.split(".")[2];
    save && (this.actor as OseActor).rollSave(save, {event});
  }

  /**
   * 
   */
  #showTweaks() {
    new OseEntityTweaks(this.actor).render(true);
  }

  /**
   * 
   * @param e 
   * @returns 
   */
  async #incrementMemorizedCount(e: Event) {
    const spell = (e.target as ItemRow)?.item;
    if (!spell) return;
    // @ts-expect-error - Types package doesn't include system prop 
    const maxAtLevel = this.actor.system.spells.slots[spell.system.lvl].max;
    // @ts-expect-error - Types package doesn't include system prop 
    const updatedUsedAtLevel = this.actor.system.spells.slots[spell.system.lvl].used + 1;
    const newValue = spell.system.cast + 1;
    
    if (updatedUsedAtLevel > maxAtLevel)
      return null;

    return await spell.update({
      'system.cast': newValue
    });
  }

  /**
   * 
   * @param e 
   * @returns 
   */
  async #decrementMemorizedCount(e: Event) {
    const spell = (e.target as ItemRow)?.item;
    if (!spell) return;

    return await spell.update({
      'system.cast': spell.system.cast - 1
    })
  }

  /**
   * 
   * @param force 
   * @param options
   * @override 
   */
  async _render(force = false, options = {}) {
    const scrollTop = this.element.find('.window-content').scrollTop();
    await super._render(force, options);
    scrollTop && this.element.find('.window-content').scrollTop(scrollTop);
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   *
   * @param html - The prepared HTML object ready to be rendered into the DOM
   *
   * @todo Click to roll HD
   */
  activateListeners(html: JQuery<HTMLElement>): void {
    // Core listeners
    super.activateListeners(html);
    
    /*
     *  VIEW LISTENERS
     */

    // Saves
    html.find('.saves .ability-score-field label')
      .on('pointerdown', this.#rollSave.bind(this))

    // Subclass view listeners
    this.viewListeners(html);

    /*
     *  EDIT LISTENERS
     */
    if (!this.isEditable) return;

    // Memorized spells increment/decrement
    Array.from(
      html[0].querySelectorAll("[type='spell'] uft-item-row")
    ).map(n => {
      n.addEventListener("charge-increment", this.#incrementMemorizedCount.bind(this))
      n.addEventListener("charge-decrement", this.#decrementMemorizedCount.bind(this))
    });

    // Allow expandable sections to create items of a specific type
    html.on("create", "uft-expandable-section", this.#onCreateItemOfType.bind(this));

    html.on("pointerdown", '[data-action="tweaks"]', this.#showTweaks.bind(this));

    // Subclass edit listeners
    this.editListeners(html);
  }

  viewListeners(_html: JQuery<HTMLElement>): void {}
  editListeners(_html: JQuery<HTMLElement>): void {}
}
