/**
 * @file Representic numeric values affected by an Active Effect.
 */

const { NumberField, SchemaField } = foundry.data.fields;

export default class OseActiveEffectNumberField extends SchemaField {
  constructor(options = {}) {
    super(
      {
        value: new NumberField({ integer: true, positive: true }),
        dynamic: new NumberField({ integer: true }),
      },
      options
    );
  }

  get total() {
    return this.value + this.dynamic;
  }
}
