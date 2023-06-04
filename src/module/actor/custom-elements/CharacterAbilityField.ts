/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";

export default class CharacterAbilityField extends BaseElement {
  static get observedAttributes() {
    return ["value", "modifier-value"];
  }

  static get styles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host {
        --asf-color-heading: var(--color-heading);
        --asf-background-heading: var(--background-color-heading);
        --asf-border: var(--background-color-heading);

        border: 1px solid var(--asf-border);

        display: flex;
        align-items: center;
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
        overflow: hidden;
      }
      :host(:focus-within) {
        box-shadow: 0 0 10px var(--color-shadow-primary);
      }
      label {
        font-family: "Signika Negative", "Signika", sans-serif;
        font-size: 12px; /* TODO: variables! ems! */
        font-weight: 700;
        text-align: center;
        color: var(--asf-color-heading);
        background: var(--asf-background-heading);
        transition: background 333ms ease-in-out,
                    border 333ms ease-in-out,
                    color 333ms ease-in-out;
        flex: 1;
        display: flex;
        align-items: center;
        height: 20px;
      }
      ::slotted(img) {
        max-width: 20px !important;
        max-height: 20px !important;
        height: auto;
        flex-basis: 20px;
        margin-left: 2px;
      }
      label span {
        flex: 1;
      }
      input {
        overflow: hidden;
        background-color: transparent;
        border: none;
        box-sizing: border-box;
        padding: 2px;
        line-height: 1em;
        flex-basis: 35px;
        text-align: center;
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
    this.#shadowRoot.adoptedStyleSheets = [CharacterAbilityField.styles];
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
    const slotWrapper: HTMLSpanElement = document.createElement("span");
    slotWrapper.append(slot);

    const iconSlot: HTMLSlotElement = document.createElement("slot");
    iconSlot.setAttribute("name", "icon");

    label.append(iconSlot, slotWrapper);

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

customElements.define("character-ability-field", CharacterAbilityField);
