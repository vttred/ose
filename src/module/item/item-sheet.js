import { OSE } from "../config";

/**
 * Extend the basic ItemSheet with some very simple modifications
 */
export class OseItemSheet extends ItemSheet {
  constructor(...args) {
    super(...args);

    /**
     * Keep track of the currently active sheet tab
     * @type {string}
     */
  }

  /**
   * Extend and override the default options used by the Simple Item Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ose", "sheet", "item"],
      width: 520,
      height: 390,
      resizable: false,
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
    const type = isNewerVersion(game.version, "10.264") ? this.item.type : this.item.type
    return `${path}/${type}-sheet.html`;
  }

  /**
   * Prepare data for rendering the Item sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    const data = super.getData().data;
    data.editable = this.document.sheet.isEditable;
    data.config = CONFIG.OSE;
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    html.find('input[data-action="add-tag"]').keypress((ev) => {
      if (ev.which == 13) {
        let value = $(ev.currentTarget).val();
        let values = value.split(",");
        this.object.pushManualTag(values);
      }
    });
    html.find(".tag-delete").click((ev) => {
      let value = ev.currentTarget.parentElement.dataset.tag;
      this.object.popManualTag(value);
    });
    html.find("a.melee-toggle").click(() => {
      this.object.update({ 'system.melee': !this.object.system.melee });
    });

    html.find("a.missile-toggle").click(() => {
      this.object.update({ 'system.missile': !this.object.system.missile })
    });

    super.activateListeners(html);
  }
}
