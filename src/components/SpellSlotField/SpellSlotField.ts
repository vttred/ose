/**
 * @file A custom element that represents item that can be clicked or summon a tooltip
 */
import BaseElement from "../_BaseElement";
// @ts-expect-error
import styles from './SpellSlotField.css' assert { type: "css" };

export default class SpellSlotField extends BaseElement {
  static get styles() {
    return [styles];
  }

  protected events(): void {
    this.setAttribute("data-dtype", "Number")

    this.shadowRoot.querySelector("#max")
      ?.addEventListener("change", this.onInput?.bind(this));
  }
  
  get #ordinalLabel() {
    const number = parseInt(this.getAttribute("level") || '0', 10);
    if (!number) return "";
    const plurals = new Intl.PluralRules("en-US", { type: "ordinal" });
    const suffixes = new Map([
      ["one", "st"],
      ["two", "nd"],
      ["few", "rd"],
      ["other", "th"],
    ]);
    const rule = plurals.select(number);
    const suffix = suffixes.get(rule);
    return `<span>${number}</span><span class="ordinal-suffix">${suffix}</span>`;
  }

  get template() {
    return /*html*/ `
      <label for="max">${this.#ordinalLabel}</label>
      <input type="number" id="remaining" readonly tabindex="-1" value="${parseInt(this.getAttribute("remaining") || '0', 10)}" />
      <span class="divider">/</span>
      <input type="number" id="max" value="${parseInt(this.getAttribute("value") || '', 10)}" min="0" step="1" />
    `;
  }

  onInput(e: Event) {
    this.value = (e.target as HTMLInputElement).value || "";
  }
}

customElements.define("spell-slot-field", SpellSlotField);
