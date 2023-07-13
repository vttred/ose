/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";
// @ts-expect-error
import styles from './CharacterAbilityField.css' assert { type: "css" };

export default class CharacterAbilityField extends BaseElement {
  static get observedAttributes() {
    return ["value", "modifier-value"];
  }

  static get styles() {
    return styles;
  }

  static formAssociated = true;

  value: string = "";

  name: string = "";

  modifierValue?: number;

  #internals: ElementInternals;

  #shadowRoot: ShadowRoot;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#shadowRoot = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    super.connectedCallback();
    this.#render();
    this.#shadowRoot.adoptedStyleSheets = [CharacterAbilityField.styles];
    this.#shadowRoot
      .querySelector(".score-field")
      ?.addEventListener("change", (e) => {
        this.onInput(e);
      });
  }

  get #template() {
    const template: HTMLTemplateElement = document.createElement("template");
    template.innerHTML = `
    <label for="${this.id}">
      <slot name="icon"></slot>
      <span>
        <slot></slot>
      </span>
    </label>
    <input 
      type="text" 
      name="${this.getAttribute('name') || ''}" 
      id="${this.getAttribute('id') || ''}" 
      autocomplete="off" 
      value="${this.getAttribute('value')?.toString() || ''}" 
      class="field score-field" 
      ${this.hasAttribute('readonly') ? 'readonly' : ''} 
      ${this.hasAttribute('disabled') ? 'disabled' : ''}
    />`;
    return template;
  }

  #render() {
    this.#shadowRoot.append(document.importNode(this.#template.content, true));
  }

  onInput(e: Event) {
    // const oldValue = parseInt(this.getAttribute("value") || "", 10);
    const newValue = (e.target as HTMLInputElement).value || "";

    // if (newValue < 0) newValue = 0;
    super.setValue(newValue);
  }
}

customElements.define("character-ability-field", CharacterAbilityField);
