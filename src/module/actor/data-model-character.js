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
      this.encumbrance.max,
      [...this.parent.items]
    );

    this.movement = new OseDataModelCharacterMove(
      this.encumbrance,
      this.config.movementAuto,
      this.movement.base
    );

    // @todo AC from armor is borked; no access to items yet.
    this.ac = new OseDataModelCharacterAC(
      this.ac.mod,
      [...getItemsOfActorOfType(this.parent, 'armor', (a) => a.system.equipped)],
      this.scores.dex.mod
    );

    // @todo AAC from armor is borked; no access to items yet.
    this.aac = new OseDataModelCharacterAC(
      this.aac.mod,
      getItemsOfActorOfType(this.parent, 'armor', (a) => a.system.equipped),
      this.scores.dex.mod,
      true,
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
    };
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
      ? this.initiative.value + this.initiative.mod + this.dex.init
      : 0;
  }
}
