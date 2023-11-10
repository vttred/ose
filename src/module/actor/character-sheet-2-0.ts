/**
 * @file Extend the basic ActorSheet with some very simple modifications
 */
import { OSE } from "../config";
import OseItem from "../item/entity";
import MajorIconField from '../../components/MajorIconField/MajorIconField';
import TippableItem from "../../components/TippableItem/TippableItem";
import skipRollDialogCheck from "../helpers-behaviour";
import OseActor from "./entity";

import OseCharacterCreator from "../dialog/character-creation";
import OseCharacterGpCost from "../dialog/character-gp-cost";
import OseCharacterModifiers from "../dialog/character-modifiers";
import OseEntityTweaks from "../dialog/entity-tweaks";

import '../../css/components.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesCommon from '../../css/sheets/character/character-sheet.module.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesAbilities from '../../css/sheets/character/tab-ability.module.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesCombat from '../../css/sheets/character/tab-combat.module.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesInventory from '../../css/sheets/character/tab-inventory.module.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesMagic from '../../css/sheets/character/tab-magic.module.css';
// @ts-expect-error - TS linter doesn't understand importing a CSS file
import stylesNotes from '../../css/sheets/character/tab-notes.module.css';

import ItemRow from "../../components/ItemRow/ItemRow";

/**
 * The character sheet that will accompany v2.0 of the system.
 * 
 * ---
 * # Phase 1:
 * 
 * @todo - Combat Tab: Hit die rolls
 * @todo - Abilities Tab: Languages
 * @todo - Inventory Tab: Zebra striping on item-rows
 * @todo - Magic Tab: How do favorite spells work?
 * @todo - General: Drag to create hotbar macros
 * @todo - General: How can we make Level/Class/XP/Next easier to manage for single/multiclass characters?
 * 
 * ---
 * # Phase 2:
 * 
 * @todo - Abilities Tab: Multiple ability buckets (class skills, special skills, etc)
 * @todo - Inventory Tab: Handling for carried/not carried
 * @todo - Inventory Tab: Encumbrance bar, allow module authors to override
 * @todo - Magic Tab: Spell Sources
 * @todo - General: Active Effects UI
 * @todo - General: HTML input fields handle changing focus with tab; how can we make custom elements do so too?
 */
export default class OseActorSheetCharacterV2 extends ActorSheet {
  /**
   * 
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
      classes: ["ose", "sheet", "actor", "character-2"],
      template: `${OSE.systemPath()}/templates/actors/character-sheet-2-0.hbs`,
      width: 668,
      height: 692,
      resizable: true,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "inventory",
        },
      ],
      dragDrop: [
        {
          dragSelector: 'uft-expandable-section:not([type="container"]) uft-item-row',
          dropSelector: 'uft-expandable-section:not([type="container"]) uft-item-row',
          callbacks: {
            dragstart: 'onDragUncontainedItem',
            drop: 'onDropSort'
          }
        },
        {
          dragSelector: 'uft-expandable-section[type="container"] uft-tippable-item',
          dropSelector: 'uft-expandable-section[type="container"] uft-tippable-item',
          callbacks: {
            dragstart: 'onDragContainedItem',
            drop: 'onDropSort'
          }
        },
        {
          dragSelector: 'uft-expandable-section:not([type="container"]) uft-item-row',
          dropSelector: 'uft-expandable-section[type="container"] :is(uft-item-row, uft-item-row > *)',
          callbacks: {
            dragstart: 'onDragUncontainedItem',
            drop: 'onDropIntoContainer'
          }
        }, 
        {
          dragSelector: 'uft-item-row uft-tippable-item',
          dropSelector: 'uft-expandable-section:not([type="container"])',
          callbacks: {
            dragstart: 'onDragContainedItem',
            drop: 'onDropOutsideContainer'
          }
        },
        {
          dragSelector: 'uft-item-row uft-tippable-item',
          dropSelector: 'uft-expandable-section[type="container"]',
          callbacks: {
            dragstart: 'onDragContainedItem',
            drop: 'onDropIntoContainer'
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
   * 
   */
  get enrichedBiography() {
    return TextEditor.enrichHTML(
      // @ts-expect-error - Document.system isn't in the types package yet
      this.actor.system.details.biography,
      { async: true }
    );
  }

  /**
   * 
   */
  get enrichedNotes() {
    // @ts-expect-error - Document.system isn't in the types package yet
    return TextEditor.enrichHTML(this.actor.system.details.notes,
      { async: true }
    );
  }

  /**
   * @override
   * @returns 
   */
  // @ts-expect-error - this async function returns an object, TS wants it to return a promise
  async getData() {
    const favoriteList = await Promise.all(this.favoriteItems);
    const favoriteItems = favoriteList
      .filter((i: Item) => !!i && i.type !== "spell" && i.type !== "ability");
    const favoriteAbilities = favoriteList
      .filter((i: Item) => !!i && i.type === "ability")
    const enrichedBiography = await this.enrichedBiography;
    const enrichedNotes = await this.enrichedNotes;

    return {
      ...super.getData(),
      styles: {
        common: stylesCommon,
        ability: stylesAbilities,
        combat: stylesCombat,
        inventory: stylesInventory,
        magic: stylesMagic,
        notes: stylesNotes
      },
      favoriteItems,
      favoriteAbilities,
      enrichedBiography,
      enrichedNotes,
      usesAscendingAC: game.settings.get(game.system.id, "ascendingAC"),
      usesInitiativeModifiers: game.settings.get(game.system.id, "initiative") !== "group",
      encumbranceScheme: game.settings.get(game.system.id, "encumbranceOption"),
    };
  }

  /**
   * @override
   * @param e 
   * @param options 
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
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @override
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

  async _onDragStart(e: DragEvent) {
    super._onDragStart(e);
  }

  // /**
  //  * 
  //  * @param e 
  //  */
  // async onDragUncontainedItem(e: DragEvent) {
  //   await this.#setInventoryItemDragData(e);
  // }

  // /**
  //  * 
  //  * @param e 
  //  */
  // async onDragContainedItem(e: DragEvent) {
  //   await this.#setInventoryItemDragData(e, true);
  // }

  // /**
  //  * 
  //  * @param e 
  //  * @param fromContainer 
  //  * @returns 
  //  */
  // async #setInventoryItemDragData(e: DragEvent, fromContainer: boolean = false) {
  //   e.stopPropagation();
  //   const item = (e.target as (TippableItem | ItemRow))?.item;
  //   if (!item) return;
  //   // @ts-expect-error - item.toDragData() isn't on the types package, but does exist
  //   const dragData = item.toDragData();
  //   dragData.fromContainer = fromContainer;
  //   e?.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
  // }

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

    const isSortingInContainer = (
      itemToMove?.system.containerId &&
      itemToDisplace?.system.containerId &&
      itemToMove?.system.containerId === itemToDisplace?.system.containerId
    );

    // If either item doesn't exist, bail,
    if (!itemToMove || !itemToDisplace) return;
    
    // If we're not dealing with contained items and the item types don't match, bail
    if (
      // @ts-expect-error - OseItem.system exists!
      (!itemToMove.system.containerId || !itemToDisplace.system.containerId) &&
      itemToMove.type !== itemToDisplace.type
    ) return;

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
    if (dragData.type !== "Item") return;

    const droppedItem = await fromUuid(dragData.uuid) as OseItem;

    if (dragData.fromContainer)
      droppedItem?.update({ "system.containerId": "" });
    else if (droppedItem?.type === "container")
      this.onMoveContainerToAnotherActor(droppedItem);
    else
      this._onDrop(e);
  }

  /**
   * 
   * @param droppedItem 
   */
  async onMoveContainerToAnotherActor(droppedItem: OseItem) {
    const containerItemObj = droppedItem.toObject();
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
  #onCreateItemOfType(e: Event) {
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

    return this.actor.createEmbeddedDocuments("Item", [{...itemToCreate, system }])
  }

  /**
   * 
   * @param event 
   */
  #rollAttributeCheck(event: Event) {
    event.preventDefault();
    const score = (event?.target as HTMLElement)
      ?.closest('uft-labeled-section')
      ?.querySelector('input[name]')
      ?.getAttribute("name")
      ?.split(".")[2];
    // We can use this when uft-ability-score-field is usable
    // const score = (event.target as HTMLElement)?.getAttribute("name")?.split(".")[2];
    score && (this.actor as OseActor).rollCheck(score, {event});
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
   * @param event 
   */
  #rollAttack (event: Event) {
    const { attackType } = ((event.target as HTMLElement)?.closest('[data-attack-type]') as HTMLElement)?.dataset;

    if (attackType)
      (this.actor as OseActor).targetAttack({ roll: {} }, attackType, {
        type: attackType,
        skipDialog: skipRollDialogCheck(event),
      });
  }

  #rollExploration (event: Event) {
    const { explorationType } = ((event.target as HTMLElement)?.closest('[data-exploration-type]') as HTMLElement)?.dataset;
    if (explorationType)
      (this.actor as OseActor).rollExploration(explorationType, {
        event,
      });
  }

  /**
   * 
   */
  #generateScores() {
    new OseCharacterCreator(this.actor, {
      top: this.position.top + 40,
      left: this.position.left + (this.position.width - 400) / 2,
    }).render(true);
  }

  /**
   * 
   */
  #showModifiers() {
    new OseCharacterModifiers(this.actor, {
      top: this.position.top + 40,
      left: this.position.left + (this.position.width - 400) / 2,
    }).render(true);
  }

  /**
   * 
   */
  #showGoldCost() {
    const items = {
      items: this.actor.items,
      owned: {
        weapons: this.actor.system.weapons,
        armors: this.actor.system.armor,
        items: this.actor.system.items,
        containers: this.actor.system.containers,
      }
    };
    new OseCharacterGpCost(this.actor, items, {
      top: this.position.top + 40,
      left: this.position.left + (this.position.width - 400) / 2,
    }).render(true);
  }

  /**
   * 
   */
  #showTweaks() {
    new OseEntityTweaks(this.actor, {
      top: this.position.top + 40,
      left: this.position.left + (this.position.width - 400) / 2,
    }).render(true);
  }

  async #incrementMemorizedCount(e: Event) {
    const spell = (e.target as ItemRow)?.item;
    if (!spell) return;
    const maxAtLevel = this.actor.system.spells.slots[spell.system.lvl].max;
    const updatedUsedAtLevel = this.actor.system.spells.slots[spell.system.lvl].used + 1;
    const newValue = spell.system.cast + 1;
    
    if (updatedUsedAtLevel > maxAtLevel)
      return null;

    return await spell.update({
      'system.cast': newValue
    });
  }

  async #decrementMemorizedCount(e: Event) {
    const spell = (e.target as ItemRow)?.item;
    if (!spell) return;

    return await spell.update({
      'system.cast': spell.system.cast - 1
    })
  }

  async #castSpell(e: PointerEvent) {
    let {uuid} = ((e.target as HTMLElement)?.closest('[data-uuid') as HTMLElement)?.dataset;
    if (!uuid) return;
    let item = await fromUuid(uuid) as OseItem;
    item?.roll();
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   *
   * @param html - The prepared HTML object ready to be rendered into the DOM
   *
   * @todo Click to roll HD
   */
  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);

    // Ability checks
    html.find('.ability-scores .ability-score-field label')
      .on('pointerdown', this.#rollAttributeCheck.bind(this))

    // Saves
    html.find('.saves .ability-score-field label')
      .on('pointerdown', this.#rollSave.bind(this))

    // Attacks
    html.find('.character-ability-field[data-attack-type] label')
      .on('pointerdown', this.#rollAttack.bind(this));

    // Attacks
    html.find('.character-ability-field[data-exploration-type] label')
      .on('pointerdown', this.#rollExploration.bind(this));

    if (!this.isEditable) return;

    // Memorized spells increment/decrement
    Array.from(
      html[0].querySelectorAll("[type='spell'] uft-item-row")
    ).map(n => {
      n.addEventListener("charge-increment", this.#incrementMemorizedCount.bind(this))
      n.addEventListener("charge-decrement", this.#decrementMemorizedCount.bind(this))
    });

    // Memorized spells cast
    html.find('uft-expandable-section[type="spell"] .slot')
      .on('pointerdown', this.#castSpell.bind(this));


    // Allow expandable sections to create items of a specific type
    html.on("create", "uft-expandable-section", this.#onCreateItemOfType.bind(this));
    
    html.on("pointerdown", '[data-action="generate-scores"]', this.#generateScores.bind(this));
    html.on("pointerdown", '[data-action="modifiers"]', this.#showModifiers.bind(this));
    html.on("pointerdown", '[data-action="gp-cost"]', this.#showGoldCost.bind(this));
    html.on("pointerdown", '[data-action="tweaks"]', this.#showTweaks.bind(this));
  }
}
