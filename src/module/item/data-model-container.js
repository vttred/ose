/**
 * @file The data model for Items of type Container
 */
export default class OseDataModelContainer extends foundry.abstract
  .TypeDataModel {
  static defineSchema() {
    const {
      SchemaField,
      StringField,
      NumberField,
      ArrayField,
      ObjectField,
      BooleanField,
    } = foundry.data.fields;
    return {
      itemIds: new ArrayField(new StringField()),
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
      itemslots: new NumberField({ min: 0, initial: 1 }),
    };
  }

  get contents() {
    if (!this.itemIds) return null;
    if (!this?.parent?.parent?.items) return null;
    const { id } = this.parent;
    return this.parent.parent.items.filter(
      ({ system: { containerId } }) => id === containerId
    );
  }

  get totalWeight() {
    return this.contents.reduce(
      (acc, { system: { weight, quantity } }) =>
        acc + weight * (quantity?.value || 1),
      0
    );
  }

  get manualTags() {
    if (!this.tags) return null;

    const tagNames = new Set(
      Object.values(CONFIG.OSE.auto_tags).map(({ label }) => label)
    );
    return this.tags
      .filter(({ value }) => !tagNames.has(value))
      .map(({ title, value }) => ({ title, value, label: value }));
  }

  get autoTags() {
    const tagNames = Object.values(CONFIG.OSE.auto_tags);

    const autoTags = this.tags.map(({ value }) =>
      tagNames.find(({ label }) => value === label)
    );

    return [...autoTags, ...this.manualTags].flat().filter((t) => !!t);
  }
}
