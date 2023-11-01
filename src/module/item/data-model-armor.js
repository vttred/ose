/**
 * @file The data model for Items of type Armor
 */
export default class OseDataModelArmor extends foundry.abstract.DataModel {
  static ArmorTypes = {
    unarmored: "OSE.armor.unarmored",
    light: "OSE.armor.light",
    heavy: "OSE.armor.heavy",
    shield: "OSE.armor.shield",
  };

  static defineSchema() {
    const {
      SchemaField,
      StringField,
      NumberField,
      BooleanField,
      ArrayField,
      ObjectField,
    } = foundry.data.fields;
    return {
      type: new StringField({
        initial: "light",
        choices: Object.keys(OseDataModelArmor.ArmorTypes),
      }),
      ac: new SchemaField({
        value: new NumberField({
          initial: 9,
        }),
      }),
      aac: new SchemaField({
        value: new NumberField({
          initial: 10,
        }),
      }),
      description: new StringField(),
      tags: new ArrayField(new ObjectField()),
      equipped: new BooleanField(),
      cost: new NumberField({ min: 0, initial: 0 }),
      containerId: new StringField(),
      quantity: new SchemaField({
        value: new NumberField({ min: 0, initial: 0 }),
        max: new NumberField({ min: 0, initial: 0 }),
      }),
      weight: new NumberField({ min: 0, initial: 0 }),
    };
  }

  get acValue() {
    return game.settings.get(game.system.id, "ascendingAC") ? this.aac.value : this.ac.value;
  }

  get manualTags() {
    if (!this.tags) return null;

    const tagNames = new Set(
      Object.values(CONFIG.OSE.auto_tags).map(({ label }) => label)
    );
    return this.tags
      .filter(({ value }) => !tagNames.has(value))
      .map(({ title, value }) => ({
        title,
        value,
        label: value,
      }));
  }

  get autoTags() {
    const tagNames = Object.values(CONFIG.OSE.auto_tags);

    const autoTags = this.tags.map(({ value }) =>
      tagNames.find(({ label }) => value === label)
    );

    return [
      { label: OseDataModelArmor.ArmorTypes[this.type], icon: "fa-tshirt" },
      ...autoTags,
      ...this.manualTags,
    ]
      .flat()
      .filter((t) => !!t);
  }
}
