/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";

export default class MajorIconField extends BaseElement {
  static get observedAttributes() {
    return ["value", "modifier-value"];
  }

  static get styles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host {
        --mif-color-heading: var(--color-heading);
        --mif-background-heading: var(--background-color-heading);
        --mif-border: var(--background-color-heading);

        display: inline-block;
      }
      :host(:not([readonly]):focus-within) {
        box-shadow: 0 0 10px var(--color-shadow-primary);
      }
      label {
        font-family: "Signika Negative", "Signika", sans-serif;
        font-size: 16px; /* TODO: variables! ems! */
        line-height: 1.5em;
        font-weight: 700;
        text-align: center;
        color: var(--mif-color-heading);
        background: var(--mif-background-heading);
        width: 100%;
        margin-bottom: 8px;
        display: block !important;
        transition: background 333ms ease-in-out,
                    border 333ms ease-in-out,
                    color 333ms ease-in-out;
      }
      .field-background-container {
        position: relative;
      }
      .value-pair {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      input {
        width: 100%;
        overflow: hidden;
        background-color: transparent;
        border: none;
        box-sizing: border-box;
        text-align: center;
        padding: 0;
        font-size: 20px;
        font-weight: 700;
        line-height: 1.4em;
      }
      input:focus {
        outline: none;
      }
      .max-field {
        border-top: 1px solid var(--mif-border);
      }
      ::slotted(img) {
        display: block;
        width: 100%;
        height: auto;
        border: none !important;
        padding: 0 8px;
        max-height: 100px;
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
    this.#shadowRoot.adoptedStyleSheets = [MajorIconField.styles];
    this.#shadowRoot
      .querySelector(".score-field")
      ?.addEventListener("change", (e) => {
        this.onInput(e);
      });
    this.#shadowRoot
      .querySelector(".max-field")
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

  get #valueInput() {
    const scoreInput: HTMLInputElement = document.createElement("input");
    scoreInput.setAttribute("type", "text");
    scoreInput.setAttribute("name", this.getAttribute("value-name") || "");
    scoreInput.setAttribute("id", this.getAttribute("id") || "");
    scoreInput.setAttribute(
      "value",
      this.getAttribute("value")?.toString() || ""
    );
    scoreInput.toggleAttribute("readonly", this.hasAttribute("readonly"));
    scoreInput.toggleAttribute("disabled", this.hasAttribute("disabled"));
    if (this.hasAttribute("readonly") || this.hasAttribute("disabled"))
      scoreInput.setAttribute("tabindex", "-1");
    scoreInput.setAttribute("class", "field score-field");

    return scoreInput;
  }

  get #maxInput() {
    if (!this.getAttribute("max")) return null;

    const scoreInput: HTMLInputElement = document.createElement("input");
    scoreInput.setAttribute("type", "text");
    scoreInput.setAttribute("name", this.getAttribute("max-name") || "");
    scoreInput.setAttribute(
      "value",
      this.getAttribute("max")?.toString() || ""
    );
    scoreInput.toggleAttribute("readonly", this.hasAttribute("readonly"));
    scoreInput.toggleAttribute("disabled", this.hasAttribute("disabled"));
    if (this.hasAttribute("readonly") || this.hasAttribute("disabled"))
      scoreInput.setAttribute("tabindex", "-1");
    scoreInput.setAttribute("class", "field max-field");

    return scoreInput;
  }

  get #fieldContainer() {
    const fieldContainer = document.createElement("div");
    fieldContainer.setAttribute("class", "value-pair");

    const fields = [this.#valueInput as Node, this.#maxInput as Node].filter(
      (n) => !!n
    );

    fieldContainer.append(...fields);

    return fieldContainer;
  }

  get #backgroundFieldContainer() {
    const backgroundSlot: HTMLSlotElement = document.createElement("slot");
    backgroundSlot.setAttribute("name", "background");

    const backgroundFieldContainer: HTMLDivElement =
      document.createElement("div");
    backgroundFieldContainer.setAttribute(
      "class",
      "field-background-container"
    );
    backgroundFieldContainer.append(this.#fieldContainer, backgroundSlot);
    return backgroundFieldContainer;
  }

  #render() {
    this.#shadowRoot.append(
      this.#label as Node,
      this.#backgroundFieldContainer as Node
    );
  }

  onInput(e: Event) {
    const oldValue = parseInt(this.getAttribute("value") || "", 10);
    let newValue = parseInt((e.target as HTMLInputElement).value || "", 10);

    if (newValue < 0) newValue = 0;
    if (Number.isNaN(newValue)) newValue = oldValue;

    super.setValue(newValue.toString());
  }
}

customElements.define("major-icon-field", MajorIconField);
