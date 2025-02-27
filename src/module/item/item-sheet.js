/**
 * @file The system-level sheet for items of any type
 */
import OSE from "../config";

/**
 * Extend the basic ItemSheet with some very simple modifications
 */
export default class OseItemSheet extends ItemSheet {
  /**
   * Extend and override the default options used by the Simple Item Sheet
   *
   * @returns {object}
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ose", "sheet", "item"],
      width: 520,
      height: 390,
      resizable: true,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    const path = `${OSE.systemPath()}/templates/items`;
    return `${path}/${this.item.type}-sheet.html`;
  }

  /**
   * Prepare data for rendering the Item sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   *
   * @returns {object} Data for the Handlebars template
   */
  async getData() {
    const { data } = super.getData();
    data.editable = this.document.sheet.isEditable;
    data.owner = this.item.isOwner;
    data.config = {
      ...CONFIG.OSE,
      encumbrance: game.settings.get(game.system.id, "encumbranceOption"),
    };
    data.enriched = {
      description: await TextEditor.enrichHTML(
        this.item.system?.description || "",
        { async: true }
      ),
    };
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   *
   * @param {JQuery} html - The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    html.find('input[data-action="add-tag"]').keypress((ev) => {
      if (ev.which === 13) {
        const value = $(ev.currentTarget).val();
        const values = value.split(",");
        this.object.pushManualTag(values);
      }
    });
    html.find(".tag-delete").click((ev) => {
      const value = ev.currentTarget.parentElement.dataset.tag;
      this.object.popManualTag(value);
    });
    html.find("a.melee-toggle").click(() => {
      this.object.update({ "system.melee": !this.object.system.melee });
    });

    html.find("a.missile-toggle").click(() => {
      this.object.update({ "system.missile": !this.object.system.missile });
    });

    html.find("a.effect-create").click(() => {
      this._onCreateEffect();
    });

    html.find("a.effect-edit").click((ev) => {
      const li = ev.currentTarget.closest(".effect-entry");
      const effect = this.item.effects.get(li.dataset.effectId);
      effect.sheet.render(true);
    });

    html.find("a.effect-delete").click((ev) => {
      const li = ev.currentTarget.closest(".effect-entry");
      this.item.effects.get(li.dataset.effectId).delete();
    });

    super.activateListeners(html);
  }

  /**
   * Handle adding new Active Effects to an Item
   */
  _onCreateEffect() {
    const activeEffect = getDocumentClass("ActiveEffect");
    activeEffect.createDialog({}, { parent: this.item });
  }
}
