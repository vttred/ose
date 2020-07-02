import { OseActor } from "./entity.js";
import { OseEntityTweaks } from "../dialog/entity-tweaks.js";

export class OseActorSheet extends ActorSheet {
  constructor(...args) {
    super(...args);
  }
  /* -------------------------------------------- */

  getData() {
    const data = super.getData();

    data.config = CONFIG.OSE;
    // Settings
    data.config.ascendingAC = game.settings.get("ose", "ascendingAC");

    // Prepare owned items
    this._prepareItems(data);

    return data;
  }

  /**
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  _prepareItems(data) {
    // Partition items by category
    let [inventory, weapons, armors, abilities, spells] = data.items.reduce(
      (arr, item) => {
        // Classify items into types
        if (item.type === "item") arr[0].push(item);
        else if (item.type === "weapon") arr[1].push(item);
        else if (item.type === "armor") arr[2].push(item);
        else if (item.type === "ability") arr[3].push(item);
        else if (item.type === "spell") arr[4].push(item);
        return arr;
      },
      [[], [], [], [], []]
    );

    // Sort spells by level
    var sortedSpells = {};
    for (var i = 0; i < spells.length; i++) {
      let lvl = spells[i].data.lvl
      if (!sortedSpells[lvl]) sortedSpells[lvl] = [];
      sortedSpells[lvl].push(spells[i]);
    }
    // Assign and return
    data.inventory = inventory;
    data.weapons = weapons;
    data.armors = armors;
    data.spells = sortedSpells;
    data.abilities = abilities;
  }

  activateListeners(html) {
    html.find(".saving-throw .attribute-name a").click((ev) => {
      let actorObject = this.actor;
      let element = event.currentTarget;
      let save = element.parentElement.parentElement.dataset.save;
      actorObject.rollSave(save, { event: event });
    });

    //Toggle Spells
    html.find(".item-cast").click(async (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      await this.actor.updateOwnedItem({
        _id: li.data("itemId"),
        data: {
          cast: !item.data.data.cast,
        },
      });
    });
    //Toggle Equipment
    html.find(".item-memorize").click(async (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      await this.actor.updateOwnedItem({
        _id: li.data("itemId"),
        data: {
          memorized: !item.data.data.memorized,
        },
      });
    });

    super.activateListeners(html);
  }

  // Override to set resizable initial size
  async _renderInner(...args) {
    const html = await super._renderInner(...args);
    this.form = html[0];

    // Resize resizable classes
    let resizable = html.find(".resizable");
    if (resizable.length == 0) {
      return;
    }
    resizable.each((_, el) => {
      let heightDelta = this.position.height - this.options.height;
      el.style.height = `${heightDelta + parseInt(el.dataset.baseSize)}px`;
    });
    return html;
  }

  async _onResize(event) {
    super._onResize(event);
    let html = $(event.path);
    let resizable = html.find(".resizable");
    resizable.each((_, el) => {
      let heightDelta = this.position.height - this.options.height;
      el.style.height = `${heightDelta + parseInt(el.dataset.baseSize)}px`;
    });
  }

  _onConfigureActor(event) {
    event.preventDefault();
    new OseEntityTweaks(this.actor, {
      top: this.position.top + 40,
      left: this.position.left + (this.position.width - 400) / 2,
    }).render(true);
  }

  /**
   * Extend and override the sheet header buttons
   * @override
   */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();

    // Token Configuration
    const canConfigure = game.user.isGM || this.actor.owner;
    if (this.options.editable && canConfigure) {
      buttons = [
        {
          label: "Tweaks",
          class: "configure-actor",
          icon: "fas fa-dice",
          onclick: (ev) => this._onConfigureActor(ev),
        },
      ].concat(buttons);
    }
    return buttons;
  }
}
