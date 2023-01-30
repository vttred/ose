/**
 * @file The base class we use for Character and Monster sheets. Shared behavior goes here!
 */
import { skipRollDialogCheck } from "../behaviourHelpers";
import OSE from "../config";
import OseEntityTweaks from "../dialog/entity-tweaks";

const cssClassItemEntry = ".item-entry";
const cssClassCaretRight = "fa-caret-right";
const cssClassCaretDown = "fa-caret-down";

export default class OseActorSheet extends ActorSheet {
  getData() {
    const data = foundry.utils.deepClone(super.getData().data);
    data.owner = this.actor.isOwner;
    data.editable = this.actor.sheet.isEditable;

    data.config = {
      ...CONFIG.OSE,
      ascendingAC: game.settings.get(game.system.id, "ascendingAC"),
      initiative: game.settings.get(game.system.id, "initiative") !== "group",
      encumbrance: game.settings.get(game.system.id, "encumbranceOption"),
    };
    data.isNew = this.actor.isNew();

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

  // eslint-disable-next-line no-underscore-dangle
  _getItemFromActor(event) {
    const li = event.currentTarget.closest(cssClassItemEntry);
    return this.actor.items.get(li.dataset.itemId);
  }

  // end Helpers

  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
  _toggleItemCategory(event) {
    event.preventDefault();
    const targetCategory = $(event.currentTarget);
    const items = targetCategory.next(".item-list");

    if (items.css("display") === "none") {
      const el = $(event.currentTarget).find(".fas.fa-caret-right");
      el.removeClass(cssClassCaretRight);
      el.addClass(cssClassCaretDown);

      items.slideDown(200);
    } else {
      const el = $(event.currentTarget).find(".fas.fa-caret-down");
      el.removeClass(cssClassCaretDown);
      el.addClass(cssClassCaretRight);

      items.slideUp(200);
    }
  }

  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
  _toggleContainedItems(event) {
    event.preventDefault();
    const targetItems = $(event.target.closest(".container"));
    const items = targetItems.find(".item-list.contained-items");

    if (items.css("display") === "none") {
      const el = targetItems.find(".fas.fa-caret-right");
      el.removeClass(cssClassCaretRight);
      el.addClass(cssClassCaretDown);

      items.slideDown(200);
    } else {
      const el = targetItems.find(".fas.fa-caret-down");
      el.removeClass(cssClassCaretDown);
      el.addClass(cssClassCaretRight);

      items.slideUp(200);
    }
  }

  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
  _toggleItemSummary(event) {
    event.preventDefault();
    const itemSummary = event.currentTarget
      .closest(".item-entry.item")
      .querySelector(".item-summary");
    itemSummary.style.display = itemSummary.style.display === "" ? "block" : "";
  }

  // eslint-disable-next-line no-underscore-dangle
  async _displayItemInChat(event) {
    const li = $(event.currentTarget).closest(cssClassItemEntry);
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
        acc.push({ _id: val, "system.containerId": "" });
        return acc;
      }, []);

      await this.actor.updateEmbeddedDocuments("Item", updateData);
    }

    // eslint-disable-next-line no-underscore-dangle
    this.actor.deleteEmbeddedDocuments("Item", [item._id]);
  }

  // eslint-disable-next-line no-underscore-dangle, consistent-return
  _useConsumable(event, decrement) {
    // eslint-disable-next-line no-underscore-dangle
    const item = this._getItemFromActor(event);
    if (!item) return null;
    let {
      quantity: { value: quantity },
    } = item.system;
    quantity = decrement ? quantity + 1 : quantity - 1;
    item.update({
      "system.quantity.value": quantity,
    });
  }

  // eslint-disable-next-line no-underscore-dangle, consistent-return
  async _onSpellChange(event) {
    event.preventDefault();
    // eslint-disable-next-line no-underscore-dangle
    const item = this._getItemFromActor(event);
    if (event.target.dataset.field === "cast") {
      return item.update({ "system.cast": parseInt(event.target.value, 10) });
    }
    if (event.target.dataset.field === "memorize") {
      return item.update({
        "system.memorized": parseInt(event.target.value, 10),
      });
    }
  }

  // eslint-disable-next-line no-underscore-dangle
  async _resetSpells(event) {
    const spells = $(event.currentTarget)
      .closest(".inventory.spells")
      // eslint-disable-next-line unicorn/no-array-callback-reference
      .find(cssClassItemEntry);
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

  // eslint-disable-next-line no-underscore-dangle
  async _rollAbility(event) {
    // eslint-disable-next-line no-underscore-dangle
    const item = this._getItemFromActor(event);
    const itemData = item?.system;
    if (item.type === "weapon") {
      if (this.actor.type === "monster") {
        item.update({
          "system.counter.value": itemData.counter.value - 1,
        });
      }
      item.rollWeapon({ skipDialog: skipRollDialogCheck(event) });
    } else if (item.type === "spell") {
      item.spendSpell({ skipDialog: skipRollDialogCheck(event) });
    } else {
      item.rollFormula({ skipDialog: skipRollDialogCheck(event) });
    }
  }

  // eslint-disable-next-line no-underscore-dangle
  async _rollSave(event) {
    const actorObject = this.actor;
    const element = event.currentTarget;
    const { save } = element.parentElement.parentElement.dataset;
    actorObject.rollSave(save, { event });
  }

  // eslint-disable-next-line no-underscore-dangle
  async _rollAttack(event) {
    const actorObject = this.actor;
    const element = event.currentTarget;
    const { attack } = element.parentElement.parentElement.dataset;
    actorObject.targetAttack({ roll: {} }, attack, {
      type: attack,
      skipDialog: skipRollDialogCheck(event),
    });
  }

  // eslint-disable-next-line no-underscore-dangle
  _onSortItem(event, itemData) {
    // eslint-disable-next-line no-underscore-dangle
    const source = this.actor.items.get(itemData._id);
    const siblings = this.actor.items.filter(
      // eslint-disable-next-line no-underscore-dangle
      (i) => i.data._id !== source.data._id
    );
    const dropTarget = event.target.closest("[data-item-id]");
    const targetId = dropTarget ? dropTarget.dataset.itemId : null;
    // eslint-disable-next-line no-underscore-dangle
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

    // eslint-disable-next-line no-underscore-dangle
    super._onSortItem(event, itemData);
  }

  // eslint-disable-next-line no-underscore-dangle
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

  // eslint-disable-next-line no-underscore-dangle, consistent-return
  async _onDropItem(event, data) {
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    const exists = !!this.actor.items.get(item.id);

    const targetId = event.target.closest(".item")?.dataset?.itemId;
    const targetItem = this.actor.items.get(targetId);
    const targetIsContainer = targetItem?.type === "container";

    const isContainer = this.actor.items.get(item.system.containerId);

    if (!exists && !targetIsContainer)
      // eslint-disable-next-line no-underscore-dangle
      return this._onDropItemCreate([itemData]);

    // eslint-disable-next-line no-underscore-dangle
    if (isContainer) return this._onContainerItemRemove(item, isContainer);

    // eslint-disable-next-line no-underscore-dangle
    if (targetIsContainer) return this._onContainerItemAdd(item, targetItem);
  }

  // eslint-disable-next-line no-underscore-dangle
  async _onContainerItemRemove(item, container) {
    const newList = container.system.itemIds.filter((s) => s !== item.id);
    const itemObj = this.object.items.get(item.id);
    await container.update({ system: { itemIds: newList } });
    await itemObj.update({ system: { containerId: "" } });
  }

  // eslint-disable-next-line no-underscore-dangle
  async _onContainerItemAdd(item, target) {
    const alreadyExistsInActor = target.parent.items.find(
      // eslint-disable-next-line no-underscore-dangle
      (i) => i._id === item._id
    );
    let latestItem = item;
    if (!alreadyExistsInActor) {
      // eslint-disable-next-line no-underscore-dangle
      const newItem = await this._onDropItemCreate([item.toObject()]);
      latestItem = newItem.pop();
    }

    const alreadyExistsInContainer = target.system.itemIds.find(
      // eslint-disable-next-line no-underscore-dangle
      (i) => i._id === latestItem._id
    );
    if (!alreadyExistsInContainer) {
      // eslint-disable-next-line no-underscore-dangle
      const newList = [...target.system.itemIds, latestItem._id];
      await target.update({ system: { itemIds: newList } });
      // eslint-disable-next-line no-underscore-dangle
      await latestItem.update({ system: { containerId: target._id } });
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
    // eslint-disable-next-line no-underscore-dangle
    const item = this.actor.items.get(droppedItem[0]._id);
    await item.update({ system: { containerId: targetContainer.id } });
    await targetContainer.update({ system: { itemIds } });
  }

  /* -------------------------------------------- */

  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
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

  // eslint-disable-next-line no-underscore-dangle, consistent-return
  _createItem(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const { treasure, type } = header.dataset;
    const createItem = (name, itemType = type) => ({
      name: name || `New ${itemType.capitalize()}`,
      type: itemType,
    });

    // Getting back to main logic
    if (type === "choice") {
      const choices = header.dataset.choices.split(",");
      // eslint-disable-next-line promise/catch-or-return, no-underscore-dangle, promise/always-return
      this._chooseItemType(choices).then((dialogInput) => {
        const itemData = createItem(dialogInput.name, dialogInput.type);
        this.actor.createEmbeddedDocuments("Item", [itemData], {});
      });
    } else {
      const itemData = createItem(type);
      if (treasure) itemData.system = { treasure: true };
      return this.actor.createEmbeddedDocuments("Item", [itemData], {});
    }
  }

  // eslint-disable-next-line no-underscore-dangle, consistent-return
  async _updateItemQuantity(event) {
    event.preventDefault();
    // eslint-disable-next-line no-underscore-dangle
    const item = this._getItemFromActor(event);

    if (event.target.dataset.field === "value") {
      return item.update({
        "system.quantity.value": parseInt(event.target.value, 10),
      });
    }
    if (event.target.dataset.field === "max") {
      return item.update({
        "system.quantity.max": parseInt(event.target.value, 10),
      });
    }
  }

  // Override to set resizable initial size
  // eslint-disable-next-line no-underscore-dangle
  async _renderInner(...args) {
    // eslint-disable-next-line no-underscore-dangle
    const html = await super._renderInner(...args);
    // eslint-disable-next-line prefer-destructuring
    this.form = html[0];

    // Resize resizable classes
    const resizable = html.find(".resizable");
    if (resizable.length === 0) {
      return;
    }
    resizable.each((_, el) => {
      const heightDelta = this.position.height - this.options.height;
      // eslint-disable-next-line no-param-reassign
      el.style.height = `${heightDelta + parseInt(el.dataset.baseSize, 10)}px`;
    });
    // eslint-disable-next-line consistent-return
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
      // eslint-disable-next-line no-param-reassign
      el.style.height = `${heightDelta + parseInt(el.dataset.baseSize, 10)}px`;
    });
    // Resize editors
    const editors = html.find(".editor");
    editors.each((id, editor) => {
      const container = editor.closest(".resizable-editor");
      if (container) {
        const heightDelta = this.position.height - this.options.height;
        // eslint-disable-next-line no-param-reassign
        editor.style.height = `${
          heightDelta + parseInt(container.dataset.editorSize, 10)
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

  /**
   * Extend and override the sheet header buttons
   *
   * @override
   */
  // eslint-disable-next-line no-underscore-dangle
  _getHeaderButtons() {
    // eslint-disable-next-line no-underscore-dangle
    let buttons = super._getHeaderButtons();

    // Token Configuration
    const canConfigure = game.user.isGM || this.actor.isOwner;
    if (this.options.editable && canConfigure) {
      buttons = [
        {
          label: game.i18n.localize("OSE.dialog.tweaks"),
          class: "configure-actor",
          icon: "fas fa-code",
          // eslint-disable-next-line no-underscore-dangle
          onclick: (event) => this._onConfigureActor(event),
        },
        ...buttons,
      ];
    }
    return buttons;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Attributes
    html.find(".saving-throw .attribute-name a").click((event) => {
      // eslint-disable-next-line no-underscore-dangle
      this._rollSave(event);
    });

    html.find(".attack a").click((event) => {
      // eslint-disable-next-line no-underscore-dangle
      this._rollAttack(event);
    });

    html.find(".hit-dice .attribute-name").click((event) => {
      this.actor.rollHitDice({ event });
    });

    // Items (Abilities, Inventory and Spells)
    html.find(".item-rollable .item-image").click(async (event) => {
      // eslint-disable-next-line no-underscore-dangle
      this._rollAbility(event);
    });

    html.find(".inventory .item-category-title").click((event) => {
      // eslint-disable-next-line no-underscore-dangle
      this._toggleItemCategory(event);
    });
    html.find(".inventory .item-category-title input").click((event) => {
      event.stopPropagation();
    });
    html.find(".inventory .category-caret").click((event) => {
      // eslint-disable-next-line no-underscore-dangle
      this._toggleContainedItems(event);
    });

    html.find(".item-name").click((event) => {
      // eslint-disable-next-line no-underscore-dangle
      this._toggleItemSummary(event);
    });

    html.find(".item-controls .item-show").click(async (event) => {
      // eslint-disable-next-line no-underscore-dangle
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
      // eslint-disable-next-line no-underscore-dangle
      const item = this._getItemFromActor(event);
      item.sheet.render(true);
    });

    html.find(".item-delete").click((event) => {
      // eslint-disable-next-line no-underscore-dangle
      const item = this._getItemFromActor(event);

      if (item?.type !== "container" || !item?.system?.itemIds?.length > 0)
        // eslint-disable-next-line no-underscore-dangle
        return this._removeItemFromActor(event);

      return Dialog.confirm({
        title: game.i18n.localize("OSE.dialog.deleteContainer"),
        content: game.i18n.localize("OSE.dialog.confirmDeleteContainer"),
        yes: () => {
          // eslint-disable-next-line no-underscore-dangle
          this._removeItemFromActor(event);
        },
        defaultYes: false,
      });
    });

    html
      .find(".quantity input")
      .click((ev) => ev.target.select())
      // eslint-disable-next-line no-underscore-dangle
      .change(this._updateItemQuantity.bind(this));

    // Consumables
    html.find(".consumable-counter .full-mark").click((event) => {
      // eslint-disable-next-line no-underscore-dangle
      this._useConsumable(event, true);
    });
    html.find(".consumable-counter .empty-mark").click((event) => {
      // eslint-disable-next-line no-underscore-dangle
      this._useConsumable(event, false);
    });

    // Spells
    html
      .find(".memorize input")
      .click((event) => event.target.select())
      // eslint-disable-next-line no-underscore-dangle
      .change(this._onSpellChange.bind(this));

    html
      .find(".spells .item-reset[data-action='reset-spells']")
      .click((event) => {
        // eslint-disable-next-line no-underscore-dangle
        this._resetSpells(event);
      });
  }
}
