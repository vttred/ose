/**
 * A specialized form used to select damage or condition types which apply to an Actor
 * @type {FormApplication}
 */
export class ActorTraitSelector extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "trait-selector",
      classes: ["maji"],
      title: "Actor Trait Selection",
      template: "systems/ose/templates/apps/trait-selector.html",
      width: 320,
      height: "auto",
      choices: {},
    });
  }

  /* -------------------------------------------- */

  /**
   * Return a reference to the target attribute
   * @type {String}
   */
  get attribute() {
    return this.options.name;
  }

  /* -------------------------------------------- */

  /**
   * Provide data to the HTML template for rendering
   * @type {Object}
   */
  getData() {
    // Get current values
    let attr = getProperty(this.object.data, this.attribute);
    // Populate choices
    const choices = duplicate(this.options.choices);
    for (let [k, v] of Object.entries(choices)) {
      choices[k] = {
        label: v,
        chosen: attr.includes(k),
      };
    }

    // Return data
    return { choices: choices };
  }

  /* -------------------------------------------- */

  /**
   * Update the Actor object with new trait data processed from the form
   * @private
   */
  _updateObject(event, formData) {
    const choices = [];
    for (let [k, v] of Object.entries(formData)) {
      if (v) {
        choices.push(k);
      }
    }
    this.object.update({[`${this.attribute}`]: choices});
  }
}
