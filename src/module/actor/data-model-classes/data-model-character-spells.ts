/**
 * @file A class representing a creature's spellcasting abilities
 */
type Slot = {
  used: number;
  max: number;
};

type Slots = {
  [n: number]: Slot;
};

type Spells = {
  [n: number]: Item[];
};

const reducedSpells = (list: Spells, item: Item) => {
  const { lvl } = item.system;
  const othersAtLvl = list[lvl] || [];
  return {
    ...list,
    [lvl]: [...othersAtLvl, item].sort((a, b) => a.name.localeCompare(b.name)),
  };
};

export interface CharacterSpells {
  enabled: boolean;
  spellList: Spells;
  slots: Slots;
}

export default class OseDataModelCharacterSpells implements CharacterSpells {
  #slots = {};

  #spellList: Item[] = [];

  #enabled: boolean;

  constructor(
    {
      enabled,
      ...maxSlots
    }: { enabled?: boolean; [n: number]: { max: number } },
    spellList: Item[] = []
  ) {
    this.#spellList = spellList;
    this.#enabled = enabled || false;

    const usedSlots = this.#spellList?.reduce(this.#reducedUsedSlots, {}) || {};

    this.#slots = Object.keys(maxSlots || {}).reduce(
      (list, item, idx) =>
        this.#usedAndMaxSlots(list, item, idx, usedSlots, maxSlots),
      {}
    );
  }

  get enabled() {
    return this.#enabled;
  }

  set enabled(state) {
    this.#enabled = state;
  }

  get spellList() {
    return this.#spellList.reduce(
      (list, item) => reducedSpells(list, item),
      {}
    );
  }

  // eslint-disable-next-line class-methods-use-this
  #reducedUsedSlots(list: { [n: number]: number }, item: Item) {
    const { lvl } = item.system;
    let { cast } = item.system;
    if (Number.isNaN(cast)) cast = 0;
    const usedAtLvl = list[lvl] || 0;
    return {
      ...list,
      [lvl]: usedAtLvl + cast,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  #usedAndMaxSlots(
    list: Slots,
    item: Item | string,
    idx: number,
    usedSlots: { [n: number]: number },
    maxSlots: { [n: number]: { max: number } }
  ) {
    if (item === "enabled") return list;
    const lv = idx + 1;
    const max = maxSlots[lv]?.max || 0;
    const used = usedSlots[lv];

    return {
      ...list,
      [lv]: { used, max },
    };
  }

  get slots(): Slots {
    return this.#slots;
  }
}
