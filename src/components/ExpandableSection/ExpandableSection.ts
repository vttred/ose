/**
 * @file A custom element that represents an Ability Score and its modifier
 */

import { dom, icon } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown, faPlus } from "@fortawesome/free-solid-svg-icons";

import BaseElement from "../_BaseElement";
import LabeledSection from "../LabeledSection/LabeledSection";
import OseActor from "../../module/actor/entity";
import { component } from "../decorators";
// @ts-expect-error
import styles from './ExpandableSection.css' assert { type: "css" };

@component('uft-expandable-section')
export default class ExpandableSection extends BaseElement {
  static get styles() {
    const iconSheet = new CSSStyleSheet();
    iconSheet.replaceSync(dom.css());
    return [...LabeledSection.styles, styles];
  }
  
  /**
   * @todo This could reasonably live on OSEItem.
   */
  static get availableTypes() {
    return Object.keys(CONFIG.Item.typeLabels);
  }

  owner?: OseActor;

  protected async prepareData(): Promise<void> {
    if (this.closest("form[data-uuid]"))
      this.owner = (await fromUuid(
        (this.closest("form[data-uuid]") as HTMLFormElement)
          ?.dataset?.uuid || ''
        ) as OseActor & {system: Record<string, any>}
      );
  }

  protected events() {
    this.shadowRoot?.querySelector('.heading')
      ?.addEventListener("click", this.#onToggle.bind(this));
    this.shadowRoot?.querySelector('.add')
      ?.addEventListener("click", this.#onAdd.bind(this));
    const hasAlwaysExpandedNodes = !!this.querySelectorAll("[slot='always-expanded']").length;
    if (!hasAlwaysExpandedNodes) {
      this.shadowRoot?.querySelector('.always-expanded')
        ?.classList.add('empty');
      this.shadowRoot?.querySelector('.always-expanded')
        ?.setAttribute('aria-hidden', "true");
    }
      
  }

  get template() {
    const addButton = (!this.#canCreate || !this.#type) ? null : /*html*/ `
      <button
        class="add"
        data-tooltip="${ExpandableSection.format(
          "OSE.UI.addItem", 
          { type:  ExpandableSection.localize(`TYPES.Item.${this.#type}`) }
        )}"
        aria-label="${ExpandableSection.format(
          "OSE.UI.addItem", 
          { type:  ExpandableSection.localize(`TYPES.Item.${this.#type}`) }
        )}"
      >${icon(faPlus).html}</button>
    `;

    const expandButton = /*html*/ `
      <button
        class="expand"
        data-tooltip="${ExpandableSection.format(
          "OSE.UI.expand", 
          { type:  ExpandableSection.localize(`TYPES.Item.${this.#type}`) }
        )}"
        aria-label="${ExpandableSection.format(
          "OSE.UI.expand", 
          { type:  ExpandableSection.localize(`TYPES.Item.${this.#type}`) }
        )}"
      >${icon(faChevronDown).html}</button>
    `;

    return /* html */ `
      <header part="heading" class="heading">
        ${expandButton}
        <slot name="heading"></slot>
        ${addButton ? addButton : ''}
      </header>
      <div class="always-expanded" part="always-expanded">
        <slot name="always-expanded"></slot>
      </div>
      <div class="collapsable">
        <main part="content">
          <slot name="content">
            <p class="empty">${ExpandableSection.localize("OSE.table.treasure.noItems")}</p>
          </slot>
        </main>
      </div>
    `
  }

  #onToggle() {
    this.toggleAttribute("aria-expanded");
  }

  /**
   * Let the sheet determine what creating an item means
   */
  #onAdd(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(new Event("create", { bubbles: true }))
  }

  get #type() {
    return this.getAttribute("type") || null;
  }

  get #canCreate() {
    return this.hasAttribute("can-create") && this.#type && ExpandableSection.availableTypes.includes(this.#type);
  }
}

