/**
 * @file A custom element that represents item that can be clicked or summon a tooltip
 */
import BaseElement from "./_BaseElement";
// @ts-expect-error
import styles from './SpellSlotField.css' assert { type: "css" };

export default class SpellSlotField extends BaseElement {
  static get styles() {
    return styles;
  }

  static formAssociated = true;
  
  #shadowRoot: ShadowRoot;

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    super.connectedCallback();

    await this.#render();
    this.#shadowRoot.adoptedStyleSheets = [SpellSlotField.styles];
    this.#shadowRoot.querySelector("#max")?.addEventListener("change", this.onInput?.bind(this));
    this.setAttribute("data-dtype", "Number")
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

  get #template() {
    const template: HTMLTemplateElement = document.createElement("template");

    template.innerHTML = `
      <label for="max">${this.#ordinalLabel}</label>
      <input type="number" id="remaining" readonly tabindex="-1" value="${parseInt(this.getAttribute("remaining") || '0', 10)}" />
      <span class="divider">/</span>
      <input type="number" id="max" value="${parseInt(this.getAttribute("value") || '', 10)}" min="0" step="1" />
    `;

    return template;
  }

  async #render() {
    this.#shadowRoot.append(document.importNode(this.#template.content, true))
  }

  onInput(e: Event) {
    const newValue = (e.target as HTMLInputElement).value || "";

    // if (newValue < 0) newValue = 0;
    super.setValue(newValue);
    // super.setValue(newValue);
  }
}

customElements.define("spell-slot-field", SpellSlotField);
