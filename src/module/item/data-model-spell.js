/**
 * @file The data model for Items of type Ability
 */
export default class OseDataModelItem extends foundry.abstract.DataModel {
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

    const rollTarget =
      this.rollTarget === undefined
        ? ""
        : ` ${CONFIG.OSE.roll_type[this.rollType]}${this.rollTarget}`;

    return {
      label: `${game.i18n.localize("OSE.items.Roll")} ${
        this.roll
      }${rollTarget}`,
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
