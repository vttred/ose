import { OseActor } from "./entity.js";
import { OseActorSheet } from "./actor-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class OseActorSheetMonster extends OseActorSheet {
  constructor(...args) {
    super(...args);
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ose", "sheet", "monster", "actor"],
      template: "systems/ose/templates/actors/monster-sheet.html",
      width: 450,
      height: 560,
      resizable: true,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".sheet-body",
          initial: "attributes",
        },
      ],
    });
  }

  /**
   * Prepare data for rendering the Actor sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    const data = super.getData();
    
    // Settings
    data.config.morale = game.settings.get('ose', 'morale');

    return data;
  }

  /* -------------------------------------------- */

  async _chooseItemType(
    choices = ['weapon', 'armor', 'shield', 'gear'],
  ) {
    let templateData = { upper: '', lower: '', types: choices },
      dlg = await renderTemplate(
        'templates/sidebar/entity-create.html',
        templateData,
      );
    //Create Dialog window
    return new Promise((resolve) => {
      new Dialog({
        title: '',
        content: dlg,
        buttons: {
          ok: {
            label: game.i18n.localize('OSE.Ok'),
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
            label: game.i18n.localize('OSE.Cancel'),
          },
        },
        default: 'ok',
      }).render(true);
    });
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    html.find(".item-create").click((event) => {
      event.preventDefault();
      const header = event.currentTarget;
      const type = header.dataset.type;

      // item creation helper func
      let createItem = function (
        type,
        name = `New ${type.capitalize()}`,
      ) {
        const itemData = {
          name: name ? name : `New ${type.capitalize()}`,
          type: type,
          data: duplicate(header.dataset),
        };
        delete itemData.data['type'];
        return itemData;
      };
      
      // Getting back to main logic
      if (type == 'choice') {
        const choices = header.dataset.choices.split(',');
        this._chooseItemType(choices).then((dialogInput) => {
          const itemData = createItem(dialogInput.type, dialogInput.name);
          this.actor.createOwnedItem(itemData, {});
        });
        return;
      }
      const itemData = createItem(type);
      return this.actor.createOwnedItem(itemData, {});
    });

    html.find(".morale-check a").click((ev) => {
      let actorObject = this.actor;
      actorObject.rollMorale({ event: event });
    });

    html.find(".hp-roll").click((ev) => {
      let actorObject = this.actor;
      actorObject.rollHP({ event: event });
    });

    // Handle default listeners last so system listeners are triggered first
    super.activateListeners(html);
  }
}
