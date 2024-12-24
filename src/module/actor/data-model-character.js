/**
 * @file The data model for Actors of type Character.
 */
import OseDataModelCharacterAC from "./data-model-classes/data-model-character-ac";
import OseDataModelCharacterMove from "./data-model-classes/data-model-character-move";
import OseDataModelCharacterScores from "./data-model-classes/data-model-character-scores";
import OseDataModelCharacterSpells from "./data-model-classes/data-model-character-spells";

const getItemsOfActorOfType = (actor, filterType, filterFn = null) =>
  actor.items
    .filter(({ type }) => type === filterType)
    .filter(filterFn || (() => true));

export default class OseDataModelCharacter extends foundry.abstract.TypeDataModel {
  prepareDerivedData() {
    this.scores = new OseDataModelCharacterScores(this.scores);

    // eslint-disable-next-line new-cap
    this.encumbrance = new CONFIG.OSE.encumbrance(
      this.encumbrance.max,
      [...this.parent.items],
      {
        significantTreasure: game.settings.get(
          game.system.id,
          "significantTreasure"
        ),
        scores: this.scores,
      }
    );

    this.movement = new OseDataModelCharacterMove(
      this.encumbrance,
      this.config.movementAuto,
      this.movement.base
    );

    // @todo Once we create the new character sheet,
    //       we shouldn't need to list both AC schemes
    this.ac = new OseDataModelCharacterAC(
      false,
      [
        ...getItemsOfActorOfType(
          this.parent,
          "armor",
          (a) => a.system.equipped
        ),
      ],
      this.scores.dex.mod,
      this.ac.mod
    );

    this.aac = new OseDataModelCharacterAC(
      true,
      getItemsOfActorOfType(this.parent, "armor", (a) => a.system.equipped),
      this.scores.dex.mod,
      this.aac.mod
    );

    this.spells = new OseDataModelCharacterSpells(this.spells, this.#spellList);
  }

  // @todo define schema options; stuff like min/max values and so on.
  static defineSchema() {
    const { StringField, NumberField, BooleanField, ObjectField, SchemaField } =
      foundry.data.fields;

    return {
      spells: new ObjectField(),
      scores: new ObjectField(),
      details: new ObjectField(),
      ac: new ObjectField(),
      aac: new ObjectField(),
      encumbrance: new ObjectField(),
      movement: new ObjectField(),
      config: new ObjectField(),
      initiative: new ObjectField(),
      hp: new SchemaField({
        hd: new StringField(),
        value: new NumberField({ integer: true }),
        max: new NumberField({ integer: true }),
      }),
      thac0: new ObjectField(),
      languages: new ObjectField(),
      saves: new SchemaField({
        breath: new SchemaField({ value: new NumberField({ integer: true }) }),
        death: new SchemaField({ value: new NumberField({ integer: true }) }),
        paralysis: new SchemaField({
          value: new NumberField({ integer: true }),
        }),
        spell: new SchemaField({ value: new NumberField({ integer: true }) }),
        wand: new SchemaField({ value: new NumberField({ integer: true }) }),
      }),
      exploration: new SchemaField({
        ft: new NumberField({ integer: true, positive: true }),
        ld: new NumberField({ integer: true, positive: true }),
        od: new NumberField({ integer: true, positive: true }),
        sd: new NumberField({ integer: true, positive: true }),
      }),
      retainer: new SchemaField({
        enabled: new BooleanField(),
        loyalty: new NumberField({ integer: true }),
        wage: new StringField(),
      }),
    };
  }

  // @todo This only needs to be public until
  //       we can ditch sharing out AC/AAC.
  // eslint-disable-next-line class-methods-use-this
  get usesAscendingAC() {
    return game.settings.get(game.system.id, "ascendingAC");
  }

  get meleeMod() {
    const ascendingAcMod = this.usesAscendingAC ? this.thac0.bba || 0 : 0;
    return (
      (this.scores.str?.mod || 0) +
      (this.thac0?.mod?.melee || 0) +
      ascendingAcMod
    );
  }

  get rangedMod() {
    const ascendingAcMod = this.usesAscendingAC ? this.thac0.bba || 0 : 0;
    return (
      (this.scores.dex?.mod || 0) +
      (this.thac0?.mod?.missile || 0) +
      ascendingAcMod
    );
  }

  get isNew() {
    const { str, int, wis, dex, con, cha } = this.scores;
    return ![str, int, wis, dex, con, cha].reduce(
      (acc, el) => acc + el.value,
      0
    );
  }

  get containers() {
    return getItemsOfActorOfType(
      this.parent,
      "container",
      ({ system: { containerId } }) => !containerId
    );
  }

  get treasures() {
    return getItemsOfActorOfType(
      this.parent,
      "item",
      ({ system: { treasure, containerId } }) => treasure && !containerId
    );
  }

  get carriedTreasure() {
    const total = this.treasures.reduce(
      (acc, { system: { quantity, cost } }) => acc + quantity.value * cost,
      0
    );
    return Math.round(total * 100) / 100;
  }

  get items() {
    return getItemsOfActorOfType(
      this.parent,
      "item",
      ({ system: { treasure, containerId } }) => !treasure && !containerId
    );
  }

  get weapons() {
    return getItemsOfActorOfType(
      this.parent,
      "weapon",
      ({ system: { containerId } }) => !containerId
    );
  }

  get armor() {
    return getItemsOfActorOfType(
      this.parent,
      "armor",
      ({ system: { containerId } }) => !containerId
    );
  }

  get abilities() {
    return getItemsOfActorOfType(
      this.parent,
      "ability",
      ({ system: { containerId } }) => !containerId
    ).sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  get #spellList() {
    return getItemsOfActorOfType(
      this.parent,
      "spell",
      ({ system: { containerId } }) => !containerId
    );
  }

  get isSlow() {
    return this.weapons.length === 0
      ? false
      : this.weapons.some(
          (item) =>
            !(
              item.type !== "weapon" ||
              !item.system.slow ||
              !item.system.equipped
            )
        );
  }

  // @todo How to test this?
  get init() {
    const group = game.settings.get(game.system.id, "initiative") !== "group";

    return group
      ? (this.initiative.value || 0) +
          (this.initiative.mod || 0) +
          this.scores.dex.init
      : 0;
  }
}
