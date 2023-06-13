/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";

export default class CharacterInfoField extends BaseElement {
  static get observedAttributes() {
    return ["value", "modifier-value"];
  }

  static get styles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host {
        border: 1px solid var(--background-color-heading);

        display: flex;
        align-items: center;
      }
      :host(:focus-within) {
        box-shadow: 0 0 10px var(--color-shadow-primary);
      }
      label {
        font-family: "Signika Negative", "Signika", sans-serif;
        font-size: 16px; /* TODO: variables! ems! */
        line-height: 38px !important;
        font-weight: 700;
        text-align: center;
        color: var(--color-heading);
        background: var(--background-color-heading);
        transition: background 333ms ease-in-out,
                    border 333ms ease-in-out,
                    color 333ms ease-in-out;
        flex-basis: 60px;
      }
      input {
        width: 100%;
        overflow: hidden;
        background-color: transparent;
        border: none;
        box-sizing: border-box;
        padding: 6px;
        line-height: 1em;
        flex: 1;
        color: var(--color-primary);
      }

      input:focus {
        outline: none;
      }
      .
    `);

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
    this.#shadowRoot.adoptedStyleSheets = [CharacterInfoField.styles];
    this.#shadowRoot
      .querySelector(".score-field")
      ?.addEventListener("change", (e) => {
        this.onInput(e);
      });
  }

  get #label() {
    const label: HTMLLabelElement = document.createElement("label");
    label.setAttribute("for", this.id);

    const slot: HTMLSlotElement = document.createElement("slot");

    label.append(slot);

    return label;
  }

  get #input() {
    const scoreInput: HTMLInputElement = document.createElement("input");
    scoreInput.setAttribute("type", "text");
    scoreInput.setAttribute("name", this.getAttribute("name") || "");
    scoreInput.setAttribute("id", this.getAttribute("id") || "");
    scoreInput.setAttribute("autocomplete", "off");
    scoreInput.setAttribute(
      "value",
      this.getAttribute("value")?.toString() || ""
    );
    scoreInput.toggleAttribute("readonly", this.hasAttribute("readonly"));
    scoreInput.toggleAttribute("disabled", this.hasAttribute("disabled"));
    scoreInput.setAttribute("class", "field score-field");

    return scoreInput;
  }

  #render() {
    this.#shadowRoot.append(this.#label as Node, this.#input as Node);
  }

  onInput(e: Event) {
    // const oldValue = parseInt(this.getAttribute("value") || "", 10);
    const newValue = (e.target as HTMLInputElement).value || "";

    // if (newValue < 0) newValue = 0;
    super.setValue(newValue);
  }
}

customElements.define("character-info-field", CharacterInfoField);
