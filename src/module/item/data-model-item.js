export default class OseDataModelItem extends foundry.abstract.DataModel {
	static defineSchema() {
		const { SchemaField, StringField, NumberField, BooleanField, ArrayField, ObjectField } = foundry.data.fields;
		return {
			treasure: new BooleanField(),
			details: new ObjectField({
				description: new StringField(),
			}),
			tags: new ArrayField(new ObjectField()),
			cost: new NumberField({ min: 0, initial: 0 }),
			containerId: new StringField(),
			quantity: new SchemaField({
				value: new NumberField({ min: 0, initial: 0 }),
				max: new NumberField({ min: 0, initial: 0 }),
			}),
			weight: new NumberField({ min: 0, initial: 0 })
		};
	}

	get manualTags() {
		if (!this.tags) return null;

		const tagNames = Object.values(CONFIG.OSE.auto_tags).map(({ label }) => label);
		return this.tags.filter(({ value }) =>
			!tagNames.includes(value)
		).map(({ title, value }) => ({ title, value, label: value }))
	}

	get autoTags() {
		const tagNames = Object.values(CONFIG.OSE.auto_tags)

		const autoTags = this.tags.map(({ value }) =>
			tagNames.find(({ label }) => value === label)
		)

		return [
			...autoTags,
			...this.manualTags
		].flat().filter(t => !!t)
	}
}