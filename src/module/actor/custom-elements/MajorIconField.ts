/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";
// @ts-expect-error
import styles from './MajorIconField.css' assert { type: "css" };

export default class MajorIconField extends BaseElement {
  static get observedAttributes() {
    return ["value", "name"];
  }

  static get styles() {
    return styles;
  }

  static formAssociated = true;

  value: string = "";

  targetName: string = "";

  modifierValue?: number;

  // @ts-expect-error - The superclass handles internals
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
    this.#shadowRoot.adoptedStyleSheets = [MajorIconField.styles];
    this.#shadowRoot.querySelector(".score-field")?.addEventListener("change", this.onInput.bind(this));
    this.#shadowRoot.querySelector(".max-field")?.addEventListener("change", this.onInput.bind(this));
  }

  get #template() {
    const template: HTMLTemplateElement = document.createElement("template");
    template.innerHTML = `
    <labeled-section unbordered>
      <label for="${this.id}" slot="heading">
        <slot></slot>
      </label>
      <div class="field-background-container" slot="content">
        <div class="value-pair">
          <input 
            type="text" 
            name="${this.getAttribute('value-name') || ''}" 
            id="${this.getAttribute('id') || ''}" 
            value="${this.getAttribute('value')?.toString() || ''}" 
            class="field score-field"
            ${(this.hasAttribute('readonly') || this.hasAttribute('disabled')) ? 'tabindex="-1"' : ''}
            ${this.hasAttribute('readonly') ? 'readonly' : ''}
            ${this.hasAttribute('disabled') ? 'disabled' : ''}
            onchange="this.onInput.bind(this)"
          />
          ${this.getAttribute('max') ? `
            <input 
              type="text"
              name="${this.getAttribute('max-name') || ''}" 
              value="${this.getAttribute('max')?.toString() || ''}" 
              class="field max-field"
              ${(this.hasAttribute('readonly') || this.hasAttribute('disabled')) ? 'tabindex="-1"' : ''}
              ${this.hasAttribute('readonly') ? 'readonly' : ''}
              ${this.hasAttribute('disabled') ? 'disabled' : ''}
              onchange="this.onInput.bind(this)"
            />
          ` : ''}
        </div>
        <slot name="background"></slot>
      </div>
    </labeled-section>`;
    return template;
  }

  #render() {
    this.#shadowRoot.append(document.importNode(this.#template.content, true));
  }

  onInput(e: Event) {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value || "";

    if (
      name === this.getAttribute("value-name") &&
      name === this.getAttribute("max-name")
    )
      return;
    
    this.targetName = name;
    super.setValue(value.toString());
  }
}

customElements.define("major-icon-field", MajorIconField);