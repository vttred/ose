export default class OseDataModelCharacterSpells {
  #slots;
  #spellList;
  #enabled;

  constructor({enabled, ...maxSlots}, spellList) {
    this.#spellList = spellList;
    this.#enabled = enabled;

    const usedSlots = this.#spellList?.reduce(this.#reducedUsedSlots, {}) || {}

    this.#slots = Object.keys(maxSlots || {}).reduce(
      (list, item, idx) => this.#usedAndMaxSlots(list, item, idx, usedSlots, maxSlots),
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
    const reducedSpells = (list, item) => {
      let {lvl} = item.system;
      let othersAtLvl = list[lvl] || [];
      return {
      ...list,
      [lvl]: [ ...othersAtLvl, item ]
    }};

    return this.#spellList.reduce(reducedSpells, {})
  }

  #reducedUsedSlots(list, item) {
    let {lvl, cast} = item.system;
    if (isNaN(cast)) cast = 0;
    let usedAtLvl = list[lvl] || 0;
    return {
    ...list,
    [lvl]: usedAtLvl + cast
  }};

  #usedAndMaxSlots(list, item, idx, usedSlots, maxSlots) {
    if (item === 'enabled') return list;
    const lv = idx + 1;
    const max = maxSlots[lv]?.max || 0;
    const used = usedSlots[lv];

    return {
      ...list,
      [lv]: {used, max}
    }
  }

  get slots() {
    return this.#slots;
  }
}