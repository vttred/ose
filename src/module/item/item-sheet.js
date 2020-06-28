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
    return mergeObject(super.defaultOptions, {
      classes: ["ose", "sheet", "item"],
      width: 500,
      height: 370,
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
    const path = "systems/ose/templates/items/";
    return `${path}/${this.item.data.type}-sheet.html`;
  }

  /**
   * Prepare data for rendering the Item sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    const data = super.getData();
    data.config = CONFIG.MAJI;
    return data;
  }

  _onDrop(event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (err) {
      return;
    }
    // Only handle Actor drops
    if (data.type !== "Actor") return;
    this.entity.update({ data: { monster: { id: data.id } } });
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    if (this.item.type == "drajule") {
      const bar = html.find(".monster-drop");
      bar[0].ondrop = this._onDrop.bind(this);
    }

    html.find(".entity").click(event => {
      event.preventDefault();
      const element = event.currentTarget;
      const entityId = element.dataset.entityId;
      const entity = game.actors.entities.find(f => f.id === entityId);
      const sheet = entity.sheet;
      if (sheet._minimized) return sheet.maximize();
      else return sheet.render(true);
    });
    super.activateListeners(html);
  }
  /* -------------------------------------------- */

  /**
   * Implement the _updateObject method as required by the parent class spec
   * This defines how to update the subject of the form when the form is submitted
   * @private
   */
  _updateObject(event, formData) {
    return this.object.update(formData);
  }
}
