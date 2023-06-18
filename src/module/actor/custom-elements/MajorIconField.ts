/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";
// @ts-expect-error
import styles from './MajorIconField.css' assert { type: "css" };

export default class MajorIconField extends BaseElement {
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
    label.setAttribute("slot", "heading");
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
    backgroundFieldContainer.setAttribute("slot", "content");

    backgroundFieldContainer.append(this.#fieldContainer, backgroundSlot);
    return backgroundFieldContainer;
  }

  #render() {
    const section: HTMLElement = document.createElement("labeled-section");
    section.toggleAttribute("unbordered", true);
    section.append(this.#label, this.#backgroundFieldContainer);

    this.#shadowRoot.append(section);
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
