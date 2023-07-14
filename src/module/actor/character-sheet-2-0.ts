/**
 * @file Extend the basic ActorSheet with some very simple modifications
 */
import { OSE } from "../config";
import OseItem from "../item/entity";
import MajorIconField from './custom-elements/MajorIconField';
import TippableItem from "./custom-elements/TippableItem";

// import OseCharacterCreator from "../dialog/character-creation";
// import OseCharacterGpCost from "../dialog/character-gp-cost";
// import OseCharacterModifiers from "../dialog/character-modifiers";

/**
 * The character sheet that will accompany v2.0 of the system.
 */
export default class OseActorSheetCharacterV2 extends ActorSheet {
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
          initial: "attributes",
        },
      ],
      dragDrop: [
        {
          dragSelector: '[data-tab="inventory"] expandable-section:not([type="container"]) item-row',
          dropSelector: '[data-tab="inventory"] expandable-section[type="container"] item-row',
          callbacks: {
            dragstart: 'onDragUncontainedItem',
            drop: 'onDropIntoContainer'
          }
        }, 
        {
          dragSelector: '[data-tab="inventory"] item-row tippable-item',
          dropSelector: '[data-tab="inventory"] expandable-section:not([type="container"])',
          callbacks: {
            dragstart: 'onDragContainedItem',
            drop: 'onDropOutsideContainer'
          }
        },
        {
          dragSelector: '[data-tab="inventory"] item-row tippable-item',
          dropSelector: '[data-tab="inventory"] expandable-section[type="container"]',
          callbacks: {
            dragstart: 'onDragContainedItem',
            drop: 'onDropIntoContainer'
          }
        },
      ]
      // filter: [{inputSelector: 'input[name="inventory-search"]', contentSelector: "[data-tab='inventory'] inventory-row"}]
    });
  }

  get favoriteItems() {
    const itemIds = (this.actor.getFlag(game.system.id, "favorite-items") ||
      []) as string[];
    return itemIds
      .map((id: string) => fromUuidSync(id) as Item)
  }

  get enrichedBiography() {
    return TextEditor.enrichHTML(
      // @ts-expect-error - Document.system isn't in the types package yet
      this.actor.system.details.biography,
      { async: true }
    );
  }

  get enrichedNotes() {
    // @ts-expect-error - Document.system isn't in the types package yet
    return TextEditor.enrichHTML(this.actor.system.details.notes,
      { async: true }
    );
  }

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
      favoriteItems,
      favoriteAbilities,
      enrichedBiography,
      enrichedNotes
    };
  }

  // eslint-disable-next-line no-underscore-dangle
  _onChangeInput(e: any) {
    // eslint-disable-next-line no-underscore-dangle
    super._onChangeInput(e);
  }

  // eslint-disable-next-line no-underscore-dangle
  _onSubmit(e: Event, options?: FormApplication.OnSubmitOptions ): Promise<Partial<Record<string, unknown>>> {
    let updateData: Record<string, unknown> = {...options?.updateData};
    const target = (e.target as MajorIconField | null);

    // Some custom elements can hold multiple values.
    // When they see a change, they pass along the name
    // of the target system field, as well, so we can
    // force the updated data into the update flow.
    if (target?.targetName && updateData) {
      updateData[target.targetName] = target.value;
    }
    
    // eslint-disable-next-line no-underscore-dangle
    return super._onSubmit(e, {...options, updateData});
  }


  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @overrides
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

      // @todo Do we even need to include this?
      // d.permissions = {
      //   dragstart: this._canDragStart.bind(this),
      //   drop: this._canDragDrop.bind(this)
      // };

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

  async onDragUncontainedItem(e: DragEvent) {
    await this.#setInventoryItemDragData(e);
  }

  async onDragContainedItem(e: DragEvent) {
    await this.#setInventoryItemDragData(e, true);
  }

  async #setInventoryItemDragData(e: DragEvent, fromContainer: boolean = false) {
    e.stopPropagation();
    const uuid = (e.target as TippableItem).uuid;
    if (!uuid) return;
    const item: OseItem | null = await fromUuid(uuid) as OseItem | null;
    if (!item) return;
    // @ts-expect-error - item.toDragData() isn't on the types package, but does exist
    const dragData = item.toDragData();
    dragData.fromContainer = fromContainer;
    e?.dataTransfer?.setData("text/plain", JSON.stringify(dragData))
  }

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
      itemToContain?.type === "container" ||
      container?.type !== "container"
    ) return;

    if (!itemToContain?.actor?.uuid || itemToContain.actor.uuid !== this.actor.uuid) {
      itemToContain = (await this.actor.createEmbeddedDocuments("Item", [itemToContain.toObject()]))[0] as OseItem;
    }

    console.info(itemToContain);

    itemToContain.update({
      'system.containerId': container.id
    })
  }
  
  async onDropOutsideContainer(e: DragEvent) {
    e.stopPropagation();
    const dragData = JSON.parse(e?.dataTransfer?.getData("text/plain") || '{type: null, uuid: null}'); 
    if (dragData.type !== "Item") return;
    const itemToFree = await fromUuid(dragData.uuid);
    if (dragData.fromContainer)
      itemToFree?.update({
        "system.containerId": ""
      });
    else super._onDrop(e);
  }

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
   * Activate event listeners using the prepared sheet HTML
   *
   * @param html - {HTML}   The prepared HTML object ready to be rendered into the DOM
   *
   * @todo Click to roll against ability score
   * @todo CLick to roll against save
   * @todo Click to roll HD
   */
  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.on("change", "ability-score-field, character-info-field, character-ability-field, major-icon-field", (e) =>
      // eslint-disable-next-line no-underscore-dangle
      this._onChangeInput(e)
    );

    html.on("create", "expandable-section", this.#onCreateItemOfType.bind(this))
  }
}
