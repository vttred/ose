/**
 * @file An application for managing the current party.
 */
import OSE from "../config";
import OseParty from "./party";
import OsePartyXP from "./party-xp";

const Party = {
  partySheet: void 0,
};

export default class OsePartySheet extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ose", "dialog", "party-sheet"],
      template: `${OSE.systemPath()}/templates/apps/party-sheet.html`,
      width: 280,
      height: 400,
      resizable: true,
      dragDrop: [
        { dragSelector: ".actor-list .actor", dropSelector: ".party-members" },
      ],
      closeOnSubmit: false,
    });
  }

  static init() {
    Party.partySheet = new OsePartySheet();
  }

  static showPartySheet(options = {}) {
    OsePartySheet.partySheet.render(true, { focus: true, ...options });
  }

  static get partySheet() {
    return Party.partySheet;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   *
   * @type {string}
   */
  get title() {
    return game.i18n.localize("OSE.dialog.partysheet");
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   *
   * @returns {object}
   */
  getData() {
    const settings = {
      ascending: game.settings.get(game.system.id, "ascendingAC"),
    };

    return {
      partyActors: OseParty.currentParty,
      // data: this.object,
      config: CONFIG.OSE,
      user: game.user,
      settings,
    };
  }

  async _addActorToParty(actor) {
    if (actor.type !== "character") {
      return;
    }

    await actor.setFlag(game.system.id, "party", true);
  }

  async _removeActorFromParty(actor) {
    await actor.setFlag(game.system.id, "party", false);
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
        case "Actor": {
          return this._onDropActor(event, data);
        }

        case "Folder": {
          return this._onDropFolder(event, data);
        }
      }
    } catch (error) {
      return false;
    }
  }

  async _onDropActor(event, data) {
    if (data.type !== "Actor") {
      return;
    }

    const { actors } = game;
    const droppedActor = await fromUuid(data.uuid);

    this._addActorToParty(droppedActor);
  }

  _recursiveAddFolder(folder) {
    folder.contents.forEach((actor) => this._addActorToParty(actor));
    folder.children.forEach((folder) => this._recursiveAddFolder(folder));
  }

  async _onDropFolder(event, data) {
    if (data.documentName !== "Actor") {
      return;
    }

    const folder = await fromUuid(data.uuid);
    if (!folder) return;

    this._recursiveAddFolder(folder);
  }

  /* - Dragging from the Party Sheet - */
  async _onDragStart(event) {
    try {
      const { uuid } = event.currentTarget.dataset;
      const dragData = (await fromUuid(uuid)).toDragData();
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

    html.find(".header #deal-xp").click(this._dealXP.bind(this));

    // Actor buttons
    const getActor = (event) => {
      const id = event.currentTarget.closest(".actor").dataset.actorId;
      return game.actors.get(id);
    };

    html.find(".field-img button[data-action='open-sheet']").click((event) => {
      getActor(event).sheet.render(true);
    });

    html
      .find(".field-img button[data-action='remove-actor']")
      .click(async (event) => {
        await this._removeActorFromParty(getActor(event));
      });
  }
}
