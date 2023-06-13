/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";

export default class AbilityScoreField extends BaseElement {
  static get observedAttributes() {
    return ["value", "modifier-value"];
  }

  static get styles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host {
        display: block;
      }
      :host(:focus-within) {
        box-shadow: 0 0 10px var(--color-shadow-primary);
      }
      :host([modifier-value]) .value-pair {
        display: grid;
        grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
      }
      input {
        width: 100%;
        overflow: hidden;
        background-color: transparent;
        border: none;
        box-sizing: border-box;
        text-align: center;
        padding: 6px 0;
        line-height: 1em;
        color: var(--color-primary);
      }
      input:focus {
        outline: none;
      }
      .modifier-field {
        border-left: 1px solid var(--background-color-heading);
        color: var(--color-secondary);
      }
      labeled-section {
        --content-padding: 4px;
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
    this.#shadowRoot.adoptedStyleSheets = [AbilityScoreField.styles];
    this.#shadowRoot
      .querySelector(".score-field")
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

  get #scoreInput() {
    const scoreInput: HTMLInputElement = document.createElement("input");
    scoreInput.setAttribute("type", "text");
    scoreInput.setAttribute("name", this.getAttribute("name") || "");
    scoreInput.setAttribute("id", this.getAttribute("id") || "");
    scoreInput.setAttribute(
      "value",
      this.getAttribute("value")?.toString() || ""
    );
    scoreInput.toggleAttribute("readonly", this.hasAttribute("readonly"));
    scoreInput.toggleAttribute("disabled", this.hasAttribute("disabled"));
    scoreInput.setAttribute("class", "field score-field");

    return scoreInput;
  }

  get #modifierInput() {
    if (!this.getAttribute("modifier-value")) return null;

    const modifierInput: HTMLInputElement = document.createElement("input");
    modifierInput.toggleAttribute("readonly", true);
    modifierInput.setAttribute(
      "value",
      this.getAttribute("modifier-value")?.toString() || ""
    );
    modifierInput.setAttribute("class", "field modifier-field");
    modifierInput.setAttribute("tabindex", "-1");

    return modifierInput;
  }

  #render() {
    const valuePairContainer: HTMLDivElement = document.createElement("div");
    valuePairContainer.setAttribute("class", "value-pair");
    valuePairContainer.setAttribute("slot", "content");

    valuePairContainer.append(
      ...[this.#scoreInput as Node, this.#modifierInput as Node].filter(
        (n) => !!n
      )
    );

    const section: HTMLElement = document.createElement("labeled-section");
    section.append(this.#label, valuePairContainer);

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

customElements.define("ability-score-field", AbilityScoreField);
