/**
 * @file A custom element that represents an Ability Score and its modifier
 */

import BaseElement from "../_BaseElement";
import OseActor from "../../module/actor/entity";
import { component } from "../decorators";
// @ts-expect-error - TS doesn't understand importing CSS
import styles from './PreparedSpellList.css' assert { type: "css" };
import OseItem from "../../module/item/entity";

@component('uft-prepared-spells')
export default class ExpandableSection extends BaseElement {
  static get styles() {
    return [styles];
  }
  
  owner?: OseActor;
  level?: number;

  protected async prepareData(): Promise<void> {
    if (this.closest("form[data-uuid]"))
      this.owner = (await fromUuid(
        (this.closest("form[data-uuid]") as HTMLFormElement)
          ?.dataset?.uuid || ''
        ) as OseActor & {system: Record<string, any>}
      );
  }

  #selectSpells(level: number) {
    // @ts-expect-error - Types package doesn't include system prop
    return this.owner?.system.spells.prepared[level - 1];
  }

  #buildLevelTemplate(level: number) {
    const spells = this.#selectSpells(level);

    const slots = spells.map(this.#buildSlotTemplate)?.join('') || [];

    return /*html*/`
      <li class="spell-level">
        <span class="spell-level__level" part="level">
          ${!this.hasAttribute('level') ? `<uft-tag-chip>${level}</uft-tag-chip>` : ''}
        </span>
        <ul class="spell-slots">
          ${slots}
        </ul>
      </li>
    `;
  }

  #buildSlotTemplate(spell: OseItem) {
    if (spell)
      return /*html*/`
        <li
          class="spell-slot"
          aria-label="${spell.name}"
          title="${spell.name}"
          id="${spell.id}"
        >
          <img src="${spell.img}" alt="" class="spell-slot__icon" />
        </li>
      `;
    return /*html*/`
      <li class="spell-slot empty"></li>
    `; 
  }

  protected events() {
    const slots = Array.from(
      (this.shadowRoot?.querySelectorAll('.spell-slot:not(.empty)') as HTMLElement[] | undefined) || []
    );

    if (slots)
      slots.forEach(slot =>
        slot.addEventListener("pointerdown", this.#onCast.bind(this)
      ));
  }

  get template() {
    // @ts-expect-error - Types package doesn't include system prop
    if (!this.owner?.system.spells?.prepared?.length) return '';

    const level = this.getAttribute('level');

    const spellLevels = level
      ? [parseInt(level, 10)]
      // @ts-expect-error - Types package doesn't include system prop
      : this.owner?.system.spells.prepared
        .map((_s: OseItem, i: number) => i+1);
    
    return /* html */ `
      <ul class="spell-levels">
        ${spellLevels.map(this.#buildLevelTemplate.bind(this))?.join('')}
      </ul>
    `
  }


  /**
   * Let the sheet determine what creating an item means
   */
  #onCast(e: Event) {
    e.stopPropagation();
    const id = (e.target as HTMLLIElement)?.closest('.spell-slot')?.id || '';
    const spell = this.owner?.items.get(id) as OseItem;
    if (spell) spell.roll();
  }
}

