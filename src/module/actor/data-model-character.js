import OseDataModelCharacterAC from "./dataModelClasses/OseDataModelCharacterAC";
import OseDataModelCharacterEncumbrance from "./dataModelClasses/OseDataModelCharacterEncumbrance";
import OseDataModelCharacterMove from "./dataModelClasses/OseDataModelCharacterMove";
import OseDataModelCharacterScores from "./dataModelClasses/OseDataModelCharacterScores";
import OseDataModelCharacterSpells from "./dataModelClasses/OseDataModelCharacterSpells";

const getItemsOfActorOfType = (actor, filterType, filterFn = null) =>
  actor.items
    .filter(({type}) => type === filterType)
    .filter(filterFn ? filterFn : () => true);

export default class OseDataModelCharacter extends foundry.abstract.DataModel {
  prepareDerivedData() {
    this.scores = new OseDataModelCharacterScores(this.scores);

    this.encumbrance = new OseDataModelCharacterEncumbrance(
      game.settings.get(game.system.id, "encumbranceOption"),
      this.encumbrance.max,
      [...this.parent.items],
      game.settings.get(game.system.id, "significantTreasure"),
    );

    this.movement = new OseDataModelCharacterMove(
      this.encumbrance,
      this.config.movementAuto,
      this.movement.base
    );

    this.ac = new OseDataModelCharacterAC(
      false,
      [...getItemsOfActorOfType(this.parent, 'armor', (a) => a.system.equipped)],
      this.scores.dex.mod,
      this.ac.mod,
    );

    this.aac = new OseDataModelCharacterAC(
      true,
      getItemsOfActorOfType(this.parent, 'armor', (a) => a.system.equipped),
      this.scores.dex.mod,
      this.aac.mod,
    );

    this.spells = new OseDataModelCharacterSpells(
      this.spells,
      this.#spellList
    )
  }

  // @TODO set up schema
  // @todo define schema
  static defineSchema() {
    const { SchemaField, StringField, NumberField, ArrayField, ObjectField } = foundry.data.fields;

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
      hp: new ObjectField(),
      thac0: new ObjectField(),
      initiative: new ObjectField(),
      init: new NumberField({readonly: true}),
      rangedMod: new NumberField({readonly: true}),
      meleeMod: new NumberField({readonly: true}),
    };
  }
  
  get meleeMod() {
    const ascendingAcMod = game.settings.get(game.system.id, 'ascendingAC')
      ? this.thac0.bba
      : 0;
    return this.scores.str.mod + this.thac0.mod.melee + ascendingAcMod;
  }
  
  get rangedMod() {
    const ascendingAcMod = game.settings.get(game.system.id, 'ascendingAC')
      ? this.thac0.bba
      : 0;
    return this.scores.dex.mod + this.thac0.mod.missile + ascendingAcMod;
  }

  get isNew() {
    return !!Object.values(this.scores).reduce((acc, el) => acc + el.value, 0);
  }

  get containers() {
    const containerContent = this.parent.items
      .filter(({system: {containerId}}) => containerId)
      .reduce((obj, item) => {
        const {containerId} = item.system;

        return {
          ...obj,
          [containerId]: obj[containerId] ? [...obj[containerId], item] : [item]
        }
      }, {});

    const containers = getItemsOfActorOfType(
      this.parent,
      'container',
      ({system: {containerId}}) => !containerId
    );

    const reducedWeight = (acc, {system: {weight, quantity}}) => (
      acc + weight * (quantity?.value || 1)
    );

    const mapItemsToContainer = (container, key) => ({
      ...container,
      system: {
        ...container.system,
        itemIds: containerContent[container.id] || [],
        totalWeight: containerContent[container.id]?.reduce(reducedWeight, 0)
      }
    });
    
    return containers.map(mapItemsToContainer);
  }
  get treasures() {
    return getItemsOfActorOfType(
      this.parent,
      'item',
      ({system: {treasure, containerId}}) => treasure && !containerId
    );
  }
  get carriedTreasure() {
    let total = this.treasures.reduce((acc, {system: {quantity, cost}}) =>
      acc + (quantity.value * cost),
      0
    );
    return Math.round(total * 100) / 100.0;
  }
  get items() {
    return getItemsOfActorOfType(
      this.parent,
      'item',
      ({system: {treasure, containerId}}) => !treasure && !containerId
    );
  }
  get weapons() {
    return getItemsOfActorOfType(
      this.parent,
      'weapon',
      ({system: {containerId}}) => !containerId
    );
  }
  get armor() {
    return getItemsOfActorOfType(
      this.parent,
      'armor',
      ({system: {containerId}}) => !containerId
    );
  }
  get abilities() {
    return getItemsOfActorOfType(
      this.parent,
      'ability',
      ({system: {containerId}}) => !containerId
    ).sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  get #spellList() {
    return getItemsOfActorOfType(
      this.parent,
      'spell',
      ({system: {containerId}}) => !containerId
    );
  }
  
  get isSlow() {
    return this.weapons.every((item) =>
      !(
        item.type !== "weapon" ||
        !item.system.slow ||
        !item.system.equipped
      ));
  }

  // @todo Work on this
  get init() {
    const group = game.settings.get(game.system.id, "initiative") !== "group"
    
    // let value, mod;

    return (group)
      ? (this.initiative.value || 0) + (this.initiative.mod || 0) + this.scores.dex.init
      : 0;
  }
}
