/**
 * @file The data model for Items of type Spell
 */
import OseTags from "../helpers-tags";

export default class OseDataModelSpell extends foundry.abstract.DataModel {
  static defineSchema() {
    const { StringField, NumberField, ArrayField, ObjectField } =
      foundry.data.fields;
    return {
      save: new StringField(),
      lvl: new NumberField({ positive: true, min: 0 }),
      class: new StringField(),
      duration: new StringField(),
      range: new StringField(),
      roll: new StringField(),
      memorized: new NumberField({ min: 0 }),
      cast: new NumberField({ min: 0 }),
      description: new StringField(),
      tags: new ArrayField(new ObjectField()),
    };
  }

  get #rollTag() {
    if (!this.roll) return null;

    const rollLabel = game.i18n.localize("OSE.items.Roll");

    const rollFormula = OseTags.rollTagFormula({
      actor: this.parent.actor,
      data: this._source,
    });

    return {
      label: `${rollLabel} ${rollFormula}`
    };
  }

  get #saveTag() {
    if (!this.save) return null;

    return {
      label: CONFIG.OSE.saves_long[this.save],
      icon: "fa-skull",
    };
  }

  get manualTags() {
    return this.tags || [];
  }

  get autoTags() {
    return [
      { label: this.class },
      { label: this.range },
      { label: this.duration },
      this.#rollTag,
      this.#saveTag,
    ].filter((t) => !!t);
  }
}
