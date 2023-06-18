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
