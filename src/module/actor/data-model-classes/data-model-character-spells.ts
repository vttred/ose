import OseItem from "../../item/entity";

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
  [n: number]: OseItem[];
};

const reducedSpells = (list: Spells, item: OseItem) => {
  // @ts-expect-error - Document.system isn't in the types package yet
  const { lvl } = item.system;
  const othersAtLvl = list[lvl] || [];
  return {
    ...list,
    [lvl]: [...othersAtLvl, item].sort((spellA, spellB) => spellA?.sort - spellB?.sort ),
  };
};

export interface CharacterSpells {
  enabled: boolean;
  spellList: Spells;
  slots: Slots;
}

export default class OseDataModelCharacterSpells implements CharacterSpells {
  #slots = {};

  #spellList: OseItem[] = [];

  #enabled: boolean;

  constructor(
    {
      enabled,
      ...maxSlots
    }: { enabled?: boolean; [n: number]: { max: number } },
    spellList: OseItem[] = []
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
  #reducedUsedSlots(list: { [n: number]: number }, item: OseItem) {
    // @ts-expect-error - Document.system isn't in the types package yet
    const { lvl } = item.system;
    // @ts-expect-error - Document.system isn't in the types package yet
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
    item: OseItem | string,
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

  get prepared() {
    const expandSlots = (spells: OseItem[], maxSlots: number) => {
      let result = Array(maxSlots).fill(null);
      let currentIndex = 0;

      spells.forEach((item: OseItem) => {
        // @ts-expect-error - Document.system isn't in the types package yet
        for (let count = 0; count < item.system.cast; count++) {
          // Check if current index is within the bounds of the result's length.
          if (currentIndex < maxSlots) {
            result[currentIndex] = item;
            currentIndex++;
          } else {
            // If we've reached or exceeded the exact length, exit the loop early.
            return result;
          }
        }
      });
      return result;
    }

    const filterOutUnprepped = (i: OseItem) =>
      // @ts-expect-error - Document.system isn't in the types package yet
      !!i.system.cast;
    const keys = Object.keys(this.spellList);
    return keys.reduce((arr: unknown[], key: string) => {
      const prepped = this.spellList[key].filter(filterOutUnprepped);
      return [...arr, expandSlots(prepped, this.#slots[key].max)];
    }, [])
  }
}
