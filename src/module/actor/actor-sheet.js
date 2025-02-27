/**
 * @file The base class we use for Character and Monster sheets. Shared behavior goes here!
 */
import OSE from "../config";
import OseEntityTweaks from "../dialog/entity-tweaks";
import skipRollDialogCheck from "../helpers-behaviour";

export default class OseActorSheet extends ActorSheet {
  constructor(...args) {
    super(...args);
    this.isLocked = true;
  }

  getData() {
    const data = foundry.utils.deepClone(super.getData().data);
    data.owner = this.actor.isOwner;
    data.editable = this.actor.sheet.isEditable;

    data.config = {
      ...CONFIG.OSE,
      ascendingAC: game.settings.get(game.system.id, "ascendingAC"),
      initiative: game.settings.get(game.system.id, "initiative") !== "group",
      encumbrance: game.settings.get(game.system.id, "encumbranceOption"),
      encumbranceStrengthMod:
        game.settings.get(game.system.id, "encumbranceItemStrengthMod") &&
        game.settings.get(game.system.id, "encumbranceOption") === "itembased",
    };
    data.isNew = this.actor.isNew();
    data.isLocked = this.isLocked;

    return data;
  }

  activateEditor(name, options, initialContent) {
    // remove some controls to the editor as the space is lacking
    // if (name === "data.details.description") {
    //   options.toolbar = "styleselect bullist hr table removeFormat save";
    // }
    super.activateEditor(name, options, initialContent);
  }

  // Helpers

  _getItemFromActor(event) {
    const li = event.currentTarget.closest(".item-entry");
    return this.actor.items.get(li.dataset.itemId);
  }

  // end Helpers

  _toggleItemCategory(event) {
    event.preventDefault();
    const targetCategory = $(event.currentTarget);
    const items = targetCategory.next(".item-list");

    if (items.css("display") === "none") {
      const el = $(event.currentTarget).find(".fas.fa-caret-right");
      el.removeClass("fa-caret-right");
      el.addClass("fa-caret-down");

      items.slideDown(200);
    } else {
      const el = $(event.currentTarget).find(".fas.fa-caret-down");
      el.removeClass("fa-caret-down");
      el.addClass("fa-caret-right");

      items.slideUp(200);
    }
  }

  _toggleContainedItems(event) {
    event.preventDefault();
    const targetItems = $(event.target.closest(".container"));
    const items = targetItems.find(".item-list.contained-items");

    if (items.css("display") === "none") {
      const el = targetItems.find(".fas.fa-caret-right");
      el.removeClass("fa-caret-right");
      el.addClass("fa-caret-down");

      items.slideDown(200);
    } else {
      const el = targetItems.find(".fas.fa-caret-down");
      el.removeClass("fa-caret-down");
      el.addClass("fa-caret-right");

      items.slideUp(200);
    }
  }

  _toggleItemSummary(event) {
    event.preventDefault();
    const itemSummary = event.currentTarget
      .closest(".item-entry.item")
      .querySelector(".item-summary");
    itemSummary.style.display = itemSummary.style.display === "" ? "block" : "";
  }

  async _displayItemInChat(event) {
    const li = $(event.currentTarget).closest(".item-entry");
    const item = this.actor.items.get(li.data("itemId"));
    item.show();
  }

  // eslint-disable-next-line no-underscore-dangle, consistent-return
  async _removeItemFromActor(item) {
    if (item.type === "ability" || item.type === "spell") {
      // eslint-disable-next-line no-underscore-dangle
      return this.actor.deleteEmbeddedDocuments("Item", [item._id]);
    }
    if (item.type !== "container" && item.system.containerId !== "") {
      const { containerId } = item.system;
      const newItemIds = this.actor.items
        .get(containerId)
        .system.itemIds.filter((o) => o !== item.id);

      await this.actor.updateEmbeddedDocuments("Item", [
        { _id: containerId, system: { itemIds: newItemIds } },
      ]);
    }
    if (item.type === "container" && item.system.itemIds) {
      const containedItems = item.system.itemIds;
      const updateData = containedItems.reduce((acc, val) => {
        // Only create update data for items that still exist on the actor
        if (this.actor.items.get(val))
          acc.push({ _id: val, "system.containerId": "" });
        return acc;
      }, []);

      await this.actor.updateEmbeddedDocuments("Item", updateData);
    }

    // eslint-disable-next-line no-underscore-dangle
    this.actor.deleteEmbeddedDocuments("Item", [item._id]);
  }

  /**
   * @param event
   * @param {bool} decrement
   */
  _useConsumable(event, decrement) {
    const item = this._getItemFromActor(event);
    if (!item) return null;
    let {
      quantity: { value: quantity },
    } = item.system;
    item.update({
      "system.quantity.value": decrement ? --quantity : ++quantity,
    });
  }

  async _onSpellChange(event) {
    event.preventDefault();
    const item = this._getItemFromActor(event);
    if (event.target.dataset.field === "cast") {
      return item.update({ "system.cast": parseInt(event.target.value) });
    }
    if (event.target.dataset.field === "memorize") {
      return item.update({
        "system.memorized": parseInt(event.target.value),
      });
    }
  }

  async _resetSpells(event) {
    const spells = $(event.currentTarget)
      .closest(".inventory.spells")
      .find(".item-entry");
    spells.each((_, el) => {
      const { itemId } = el.dataset;
      const item = this.actor.items.get(itemId);
      const itemData = item?.system;
      item.update({
        _id: item.id,
        "system.cast": itemData.memorized,
      });
    });
  }

  async _rollAbility(event) {
    const item = this._getItemFromActor(event);
    const itemData = item?.system;
    if (item.type === "weapon") {
      if (this.actor.type === "monster") {
        item.update({
          "system.counter.value": itemData.counter.value - 1,
        });
      }
      item.rollWeapon({ skipDialog: skipRollDialogCheck(event) });
    } else if (item.type == "spell") {
      item.spendSpell({ skipDialog: skipRollDialogCheck(event) });
    } else {
      item.rollFormula({ skipDialog: skipRollDialogCheck(event) });
    }
  }

  async _rollSave(event) {
    const actorObject = this.actor;
    const element = event.currentTarget;
    const { save } = element.parentElement.parentElement.dataset;
    actorObject.rollSave(save, { event });
  }

  async _rollAttack(event) {
    const actorObject = this.actor;
    const element = event.currentTarget;
    const { attack } = element.parentElement.parentElement.dataset;
    actorObject.targetAttack({ roll: {} }, attack, {
      type: attack,
      skipDialog: skipRollDialogCheck(event),
    });
  }

  _onSortItem(event, itemData) {
    const source = this.actor.items.get(itemData._id);
    const siblings = this.actor.items.filter(
      (i) => i.data._id !== source.data._id
    );
    const dropTarget = event.target.closest("[data-item-id]");
    const targetId = dropTarget ? dropTarget.dataset.itemId : null;
    const target = siblings.find((s) => s.data._id === targetId);
    if (!target) throw new Error(`Couldn't drop near ${event.target}`);
    const targetData = target?.system;

    // Dragging items into a container
    if (
      (target?.type === "container" || target?.data?.type === "container") &&
      targetData.containerId === ""
    ) {
      this.actor.updateEmbeddedDocuments("Item", [
        { _id: source.id, "system.containerId": target.id },
      ]);
      return;
    }
    if (source?.system.containerId !== "") {
      this.actor.updateEmbeddedDocuments("Item", [
        { _id: source.id, "system.containerId": "" },
      ]);
    }

    super._onSortItem(event, itemData);
  }

  _onDragStart(event) {
    const li = event.currentTarget;
    let itemIdsArray = [];
    if (event.target.classList.contains("content-link")) return;

    let dragData;

    // Owned Items
    if (li.dataset.itemId) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item.toDragData();
      dragData.item = item;
      dragData.type = "Item";
      if (item.type === "container" && item.system.itemIds.length > 0) {
        // otherwise JSON.stringify will quadruple stringify for some reason
        itemIdsArray = item.system.itemIds;
      }
    }

    // Create drag data
    dragData.actorId = this.actor.id;
    dragData.sceneId = this.actor.isToken ? canvas.scene?.id : null;
    dragData.tokenId = this.actor.isToken ? this.actor.token.id : null;
    dragData.pack = this.actor.pack;

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.actor.effects.get(li.dataset.effectId);
      dragData.type = "ActiveEffect";
      dragData.data = effect.data;
    }

    // Set data transfer
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify(dragData, (key, value) => {
        if (key === "itemIds") {
          // something about how this Array is created makes its elements not real Array elements
          // we go through this hoop to trick stringify into creating our string
          return JSON.stringify(itemIdsArray);
        }
        return value;
      })
    );
  }

  // eslint-disable-next-line no-underscore-dangle
  async _onDropFolder(event, data) {
    const folder = await fromUuid(data.uuid);
    if (!folder || folder.type !== "Item") return;

    let itemArray = folder.contents || [];

    folder.getSubfolders(true).forEach((subfolder) => {
      itemArray.push(...subfolder.contents);
    });

    // Compendium items
    if (itemArray.length > 0 && itemArray[0]?.uuid?.includes("Compendium")) {
      const items = [];
      itemArray.forEach(async (item) => {
        items.push(await fromUuid(item.uuid));
      });
      itemArray = items;
    }

    this._onDropItemCreate(itemArray);
  }

  // eslint-disable-next-line no-underscore-dangle
  async _onDropItem(event, data) {
    const targetId = event.target.closest(".item")?.dataset?.itemId;
    const targetItem = this.actor.items.get(targetId);
    const targetIsContainer = targetItem?.type === "container";

    // This eats the event.target as it is parsed with the TextEditor.
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    const exists = !!this.actor.items.get(item.id);

    const isContainer = this.actor.items.get(item.system.containerId);

    // Issue: https://github.com/vttred/ose/issues/357
    if (item.id === targetId) return;

    if (!exists && !targetIsContainer)
      // eslint-disable-next-line no-underscore-dangle
      return this._onDropItemCreate([itemData]);

    // eslint-disable-next-line no-underscore-dangle
    if (isContainer) return this._onContainerItemRemove(item, isContainer);

    // eslint-disable-next-line no-underscore-dangle
    if (targetIsContainer) return this._onContainerItemAdd(item, targetItem);
  }

  async _onContainerItemRemove(item, container) {
    const newList = container.system.itemIds.filter((s) => s != item.id);
    const itemObj = this.object.items.get(item.id);
    await container.update({ system: { itemIds: newList } });
    await itemObj.update({ system: { containerId: "" } });
  }

  async _onContainerItemAdd(item, target) {
    const alreadyExistsInActor = target.parent.items.find(
      (i) => i.id === item.id
    );
    let latestItem = item;
    if (!alreadyExistsInActor) {
      // eslint-disable-next-line no-underscore-dangle
      const newItem = await this._onDropItemCreate([item.toObject()]);
      latestItem = newItem.pop();
    }

    const alreadyExistsInContainer = target.system.itemIds.find(
      (i) => i.id === latestItem.id
    );
    if (!alreadyExistsInContainer) {
      const newList = [...target.system.itemIds, latestItem.id];
      await target.update({ system: { itemIds: newList } });
      await latestItem.update({ system: { containerId: target.id } });
    }
  }

  // eslint-disable-next-line no-underscore-dangle, consistent-return
  async _onDropItemCreate(droppedItem, targetContainer = false) {
    // override to fix hidden items because their original containers don't exist on this actor
    const droppedItemArray = Array.isArray(droppedItem)
      ? droppedItem
      : [droppedItem];
    droppedItemArray.forEach((item) => {
      if (item.system.containerId && item.system.containerId !== "")
        // eslint-disable-next-line no-param-reassign
        item.system.containerId = "";
      if (
        item.type === "container" &&
        typeof item.system.itemIds === "string"
      ) {
        // itemIds was double stringified to fix strange behavior with stringify blanking our Arrays
        const containedItems = JSON.parse(item.system.itemIds);
        containedItems.forEach((containedItem) => {
          // eslint-disable-next-line no-param-reassign
          containedItem.system.containerId = "";
        });
        droppedItem.push(...containedItems);
      }
    });
    if (!targetContainer) {
      return this.actor.createEmbeddedDocuments("Item", droppedItem);
    }

    const { itemIds } = targetContainer.system;
    itemIds.push(droppedItem.id);
    const item = this.actor.items.get(droppedItem[0].id);
    await item.update({ system: { containerId: targetContainer.id } });
    await targetContainer.update({ system: { itemIds } });
  }

  /* -------------------------------------------- */

  async _chooseItemType(choices = ["weapon", "armor", "shield", "gear"]) {
    const templateData = { types: choices };
    const dlg = await renderTemplate(
      `${OSE.systemPath()}/templates/items/entity-create.html`,
      templateData
    );
    // Create Dialog window
    return new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("OSE.dialog.createItem"),
        content: dlg,
        buttons: {
          ok: {
            label: game.i18n.localize("OSE.Ok"),
            icon: '<i class="fas fa-check"></i>',
            callback: (html) => {
              resolve({
                type: html.find('select[name="type"]').val(),
                name: html.find('input[name="name"]').val(),
              });
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("OSE.Cancel"),
          },
        },
        default: "ok",
      }).render(true);
    });
  }

  // eslint-disable-next-line no-underscore-dangle
  _createItem(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const { treasure, type, lvl } = header.dataset;
    const createItem = (type, name) => ({
      name: name || `New ${type.capitalize()}`,
      type,
    });

    // Getting back to main logic
    if (type === "choice") {
      const choices = header.dataset.choices.split(",");
      this._chooseItemType(choices).then((dialogInput) => {
        const itemData = createItem(dialogInput.type, dialogInput.name);
        this.actor.createEmbeddedDocuments("Item", [itemData], {});
      });
    } else {
      const itemData = createItem(type);
      if (treasure) itemData.system = { treasure: true };
      // when creating a new spell on the character sheet, we need to set the level
      if (type === "spell") itemData.system = lvl ? { lvl } : { lvl: 1 };
      return this.actor.createEmbeddedDocuments("Item", [itemData], {});
    }
  }

  async _updateItemQuantity(event) {
    event.preventDefault();
    const item = this._getItemFromActor(event);

    if (event.target.dataset.field === "value") {
      return item.update({
        "system.quantity.value": parseInt(event.target.value),
      });
    }
    if (event.target.dataset.field === "max") {
      return item.update({
        "system.quantity.max": parseInt(event.target.value),
      });
    }
  }

  async _lockUnlock(event) {
    event.preventDefault();
    this.isLocked = !this.isLocked;
    this.render();
  }

  // Override to set resizable initial size
  // eslint-disable-next-line no-underscore-dangle
  async _renderInner(...args) {
    const html = await super._renderInner(...args);
    this.form = html[0];

    // Resize resizable classes
    const resizable = html.find(".resizable");
    if (resizable.length === 0) {
      return;
    }
    resizable.each((_, el) => {
      const heightDelta = this.position.height - this.options.height;
      el.style.height = `${heightDelta + parseInt(el.dataset.baseSize)}px`;
    });
    return html;
  }

  // eslint-disable-next-line no-underscore-dangle
  async _onResize(event) {
    // eslint-disable-next-line no-underscore-dangle
    super._onResize(event);

    const html = $(this.form);
    const resizable = html.find(".resizable");
    if (resizable.length === 0) {
      return;
    }
    // Resize divs
    resizable.each((_, el) => {
      const heightDelta = this.position.height - this.options.height;
      el.style.height = `${heightDelta + parseInt(el.dataset.baseSize)}px`;
    });
    // Resize editors
    const editors = html.find(".editor");
    editors.each((id, editor) => {
      const container = editor.closest(".resizable-editor");
      if (container) {
        const heightDelta = this.position.height - this.options.height;
        editor.style.height = `${
          heightDelta + parseInt(container.dataset.editorSize)
        }px`;
      }
    });
  }

  // eslint-disable-next-line no-underscore-dangle
  _onConfigureActor(event) {
    event.preventDefault();
    new OseEntityTweaks(this.actor, {
      top: this.position.top + 40,
      left: this.position.left + (this.position.width - 400) / 2,
    }).render(true);
  }

  // Active Effects Handling

  /**
   * Extend and override the sheet header buttons
   *
   * @override
   */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();

    // Token Configuration
    const canConfigure = game.user.isGM || this.actor.isOwner;
    if (this.options.editable && canConfigure) {
      buttons = [
        {
          label: game.i18n.localize("OSE.dialog.tweaks"),
          class: "configure-actor",
          icon: "fas fa-code",
          onclick: (event) => this._onConfigureActor(event),
        },
      ].concat(buttons);
    }
    return buttons;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Lock/Unlock
    html.find("a[data-action='lock-unlock']").click((ev) => {
      this._lockUnlock(ev);
    });

    // Attributes
    html.find(".saving-throw .attribute-name a").click((event) => {
      this._rollSave(event);
    });

    html.find(".attack a").click((event) => {
      this._rollAttack(event);
    });

    html.find(".hit-dice .attribute-name").click((event) => {
      this.actor.rollHitDice({ event });
    });

    // Items (Abilities, Inventory and Spells)
    html.find(".item-rollable .item-image").click(async (event) => {
      this._rollAbility(event);
    });

    html.find(".inventory .item-category-title").click((event) => {
      this._toggleItemCategory(event);
    });
    html.find(".inventory .item-category-title input").click((event) => {
      event.stopPropagation();
    });
    html.find(".inventory .category-caret").click((event) => {
      this._toggleContainedItems(event);
    });

    html.find(".item-name").click((event) => {
      this._toggleItemSummary(event);
    });

    html.find(".item-controls .item-show").click(async (event) => {
      this._displayItemInChat(event);
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Item Management
    html.find(".item-create").click((event) => {
      // eslint-disable-next-line no-underscore-dangle
      this._createItem(event);
    });

    html.find(".item-edit").click((event) => {
      const item = this._getItemFromActor(event);
      item.sheet.render(true);
    });

    html.find(".item-delete").click((event) => {
      const item = this._getItemFromActor(event);

      if (item?.type !== "container" || !item?.system?.itemIds?.length > 0)
        return this._removeItemFromActor(item);

      Dialog.confirm({
        title: game.i18n.localize("OSE.dialog.deleteContainer"),
        content: game.i18n.localize("OSE.dialog.confirmDeleteContainer"),
        yes: () => {
          this._removeItemFromActor(item);
        },
        defaultYes: false,
      });
    });

    html
      .find(".quantity input")
      .click((ev) => ev.target.select())
      .change(this._updateItemQuantity.bind(this));

    // Consumables
    html.find(".consumable-counter .full-mark").click((event) => {
      this._useConsumable(event, true);
    });
    html.find(".consumable-counter .empty-mark").click((event) => {
      this._useConsumable(event, false);
    });

    // Spells
    html
      .find(".memorize input")
      .click((event) => event.target.select())
      .change(this._onSpellChange.bind(this));

    html
      .find(".spells .item-reset[data-action='reset-spells']")
      .click((event) => {
        this._resetSpells(event);
      });

    html.find("a.effect-create").click(() => {
      this._onCreateEffect();
    });

    html.find("a.effect-edit").click((ev) => {
      const li = ev.currentTarget.closest(".effect-entry");
      const effect = this.actor.effects.get(li.dataset.effectId);
      effect.sheet.render(true);
    });

    html.find("a.effect-delete").click((ev) => {
      const li = ev.currentTarget.closest(".effect-entry");
      this.actor.effects.get(li.dataset.effectId).delete();
    });
  }
}
