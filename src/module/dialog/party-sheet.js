import { OsePartyXP } from "./party-xp.js";

export class OsePartySheet extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ose", "dialog", "party-sheet"],
      template: "systems/ose/dist/templates/apps/party-sheet.html",
      width: 280,
      height: 400,
      resizable: true,
      dragDrop: [{ dragSelector: null, dropSelector: ".party-members" }]
    });
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   * @type {String}
   */
  get title() {
    return game.i18n.localize("OSE.dialog.partysheet");
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    const settings = {
      ascending: game.settings.get("ose", "ascendingAC"),
    };
    let data = {
      data: this.object,
      config: CONFIG.OSE,
      user: game.user,
      settings: settings,
    };
    return data;
  }

  async _addActorToParty(actor) {
    await actor.setFlag(
      "ose",
      "party",
      true
    );
  }

  async _removeActorFromParty(actor) {
    await actor.setFlag(
      "ose",
      "party",
      false
    );
  }

  /* ---------------------- */
  /* --Drag&Drop Behavior-- */
  /* ---------------------- */

  /* - Adding to the Party Sheet -*/
  _onDrop(event) {
    event.preventDefault();

    // WIP Drop Items
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));

      switch (data.type) {
        case "Actor":
          return this._onDropActor(event, data);
        case "Item":
          return this._onDropItem(event, data);
        case "Folder":
          return this._onDropFolder(event, data);
      }
    } catch (err) {
      return false;
    }
  }

  _onDropItem(event, data) {
    console.log("got an item:", data);

    const itemId = data["id"];
  }

  _onDropActor(event, data) {
    const actors = this.object.documents;
    let droppedActor = actors.find(actor => actor.id === data.id);

    this._addActorToParty(droppedActor);
  }

  _onDropFolder(event, data) {

    const folder = game.folders.get(data.id);
    if (!folder) return [];

    switch (data.documentName) {
      case "Actor":
        folder.content.forEach(actor => this._addActorToParty(actor));
        break;
      case "Item":
        break;
    }
  }
  /* -------------------------------------------- */

  async _dealXP(ev) {
    new OsePartyXP(this.object, {}).render(true);
  }

  async _selectActors(ev) {
    const actorDocuments = this.object.documents.sort(
      (a, b) => b.data.token.disposition - a.data.token.disposition
    );
    const template = "systems/ose/dist/templates/apps/party-select.html";
    const templateData = {
      actors: actorDocuments,
    };
    const content = await renderTemplate(template, templateData);
    new Dialog(
      {
        title: game.i18n.localize("OSE.dialog.partyselect"),
        content: content,
        buttons: {
          set: {
            icon: '<i class="fas fa-save"></i>',
            label: game.i18n.localize("OSE.Update"),
            callback: async (html) => {
              let checks = html.find("input[data-action='select-actor']");
              await Promise.all(
                checks.map(async (_, c) => {
                  let key = c.getAttribute("name");
                  await this.object.documents[key].setFlag(
                    "ose",
                    "party",
                    c.checked
                  );
                })
              );
              this.render(true);
            },
          },
        },
      },
      {
        height: "auto",
        width: 260,
        classes: ["ose", "dialog", "party-select"],
      }
    ).render(true);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html
      .find(".item-controls .item-control .select-actors")
      .click(this._selectActors.bind(this));

    html
      .find(".item-controls .item-control .deal-xp")
      .click(this._dealXP.bind(this));

    html.find("a.resync").click(() => this.render(true));

    // Actor buttons
    const getActor = (event) => {
      const id = event.currentTarget.closest(".actor").dataset.actorId;
      return game.actors.get(id)
    };

    html
      .find(".field-img button[data-action='open-sheet']")
      .click((event) => {
        getActor(event).sheet.render(true);
      });

    html
      .find(".field-img button[data-action='remove-actor']")
      .click(async (event) => {
        await this._removeActorFromParty(getActor(event));
        this.render();
      });
  }
}
