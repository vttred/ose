/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";
// @ts-expect-error
import styles from './AbilityScoreField.css' assert { type: "css" };

export default class AbilityScoreField extends BaseElement {
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
    this.#shadowRoot.adoptedStyleSheets = [AbilityScoreField.styles];
    this.#shadowRoot
      .querySelector(".score-field")
      ?.addEventListener("change", (e) => {
        this.onInput(e);
      });

    if (!this.hasAttribute("readonly") && !this.hasAttribute("disabled"))
      this.#shadowRoot
        .querySelector("label")
        ?.addEventListener("click", (e) => {
          const evt = new Event("roll") as Event & {metaKey: boolean, ctrlKey: boolean};
          evt.metaKey = e.metaKey;
          evt.ctrlKey = e.ctrlKey;
          this.dispatchEvent(evt);
        })
  }

  get #template() {
    const template: HTMLTemplateElement = document.createElement("template");
    template.innerHTML = `
    <labeled-section>
      <label for="${this.id}" slot="heading">
        <slot></slot>
      </label>
      <div class="value-pair" slot="content">
        <input 
          type="text" 
          name="${this.getAttribute('name') || ''}"
          id="${this.getAttribute('id') || ''}"
          value="${this.getAttribute('value')?.toString() || ''}" 
          class="field score-field" 
          ${this.hasAttribute('readonly') ? 'readonly' : ''} 
          ${this.hasAttribute('disabled') ? 'disabled' : ''}
        />
        ${this.getAttribute('modifier-value') ? `
          <input 
            type="text" 
            value="${this.getAttribute('modifier-value')?.toString() || ''}" 
            class="field modifier-field"
            readonly 
            tabindex="-1"
          />
        ` : ''}
      </div>
    </labeled-section>`;
    return template;
  }

  #render() {
    this.#shadowRoot.append(document.importNode(this.#template.content, true));
  }

  onInput(e: Event) {
    const oldValue = parseInt(this.getAttribute("value") || "", 10);
    let newValue = parseInt((e.target as HTMLInputElement).value || "", 10);

    if (newValue < 0) newValue = 0;
    if (Number.isNaN(newValue)) newValue = oldValue;

    super.setValue(newValue.toString());
  }
}

customElements.define("ability-score-field", AbilityScoreField);
