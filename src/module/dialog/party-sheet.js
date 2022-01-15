import { OsePartyXP } from "./party-xp.js";

export class OsePartySheet extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ose", "dialog", "party-sheet"],
      template: "systems/ose/dist/templates/apps/party-sheet.html",
      width: 280,
      height: 400,
      resizable: true,
      dragDrop: [{ dragSelector: ".actor-list .actor", dropSelector: ".party-members" }]
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
        case "Folder":
          return this._onDropFolder(event, data);
      }
    } catch (err) {
      return false;
    }
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
    }
  }

  /* - Dragging from the Party Sheet - */
  _onDragStart(event) {
    try {
      const actorId = event.currentTarget.dataset.actorId;

      const dragData = {
        id: actorId,
        type: "Actor"
      };

      // Set data transfer
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    } catch (error) {
      return false;
    }

    return true;
  }

  /* -------------------------------------------- */

  async _dealXP(ev) {
    new OsePartyXP(this.object, {}).render(true);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html
      .find(".header #deal-xp")
      .click(this._dealXP.bind(this));

    html.find(".header #resync").click(() => this.render(true));

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
        this.render(true);
      });
  }
}
