export default class OseDataModelWeapon extends foundry.abstract.DataModel {
	static defineSchema() {
		const { SchemaField, StringField, NumberField, BooleanField, ArrayField, ObjectField } = foundry.data.fields;
		return {
			damage: new StringField(),
			description: new StringField(),
			tags: new ArrayField(new ObjectField()),
			equipped: new BooleanField(),
			save: new StringField,
			range: new SchemaField({
				short: new NumberField({ integer: true, min: 0, initial: 0 }),
				medium: new NumberField({ integer: true, min: 0, initial: 0 }),
				long: new NumberField({ integer: true, min: 0, initial: 0 }),
			}),
			bonus: new NumberField({}),
			pattern: new StringField(),
			missile: new BooleanField(),
			melee: new BooleanField(),
			slow: new BooleanField(),
			counter: new SchemaField({
				value: new NumberField({ integer: true, min: 0, initial: 0 }),
				max: new NumberField({ integer: true, min: 0, initial: 0 })
			}),
			cost: new NumberField({ min: 0, initial: 0 }),
			containerId: new StringField(),
			quantity: new SchemaField({
				value: new NumberField({ min: 0 }),
				max: new NumberField({ min: 0 }),
			}),
			weight: new NumberField({ min: 0 })
		};
	}

	get #missileTag() {
		if (!this.missile) return null;
		return [
			CONFIG.OSE.auto_tags.missile,
			{
				label: `${this.range.short}/${this.range.medium}/${this.range.long}`,
				icon: 'fa-bullseye'
			}
		];
	}

	get #meleeTag() {
		if (!this.melee) return null;
		return CONFIG.OSE.auto_tags.melee;
	}

	get #slowTag() {
		if (!this.slow) return null;
		return CONFIG.OSE.auto_tags.slow;
	}

	get #saveTag() {
		if (!this.save) return null;

		return {
			label: CONFIG.OSE.saves_long[this.save],
			icon: 'fa-skull'
		}
	}

	get manualTags() {
		if (!this.tags) return null;

		const tagNames = Object.values(CONFIG.OSE.auto_tags).map(({ label }) => label);
		return this.tags.filter(({ value }) =>
			!tagNames.includes(value)
		)
	}


	get autoTags() {
		const tagNames = Object.values(CONFIG.OSE.auto_tags)

		const autoTags = this.tags.map(({ value }) =>
			tagNames.find(({ label }) => value === label)
		)

		return [
			{ label: this.damage, icon: 'fa-tint' },
			this.#meleeTag,
			this.#missileTag,
			this.#slowTag,
			...autoTags,
			this.#saveTag,
		].flat().filter(t => !!t)
	}
}