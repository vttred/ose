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
      width: 520,
      height: 380,
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
    data.config = CONFIG.OSE;
    return data;
  }

  /* -------------------------------------------- */

  _pushTag(values) {
    const data = this.object.data.data;
    let update = [];
    if (data.tags) {
      update = duplicate(data.tags);
    }
    var regExp = /\(([^)]+)\)/;
    if (update) {
      values.forEach(val => {
        // Catch infos in brackets
        var matches = regExp.exec(val);
        let title = "";
        if (matches) {
          title = matches[1];
          val = val.substring(0, matches.index);
        }
        update.push({title: title, value: val});
      })
    } else {
      update = values;
    }
    let newData = {
      tags: update
    };
    return this.object.update({ data: newData });
  }

  _popTag(value) {
    const data = this.object.data.data;
    let update = data.tags.filter((el) => el.value != value);
    let newData = {
      tags: update
    };
    return this.object.update({ data: newData });
  }
  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    html.find('input[data-action="add-tag"]').keypress((ev) => {
      if (event.which == 13) {
        let value = $(ev.currentTarget).val();
        let values = value.split(',');
        this._pushTag(values);
      }
    });
    html.find('.tag-delete').click((ev) => {
      let value = ev.currentTarget.parentElement.dataset.tag;
      this._popTag(value);
    });
    super.activateListeners(html);
  }
}
