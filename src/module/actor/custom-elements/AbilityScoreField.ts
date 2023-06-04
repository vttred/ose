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
        --asf-color-heading: var(--color-heading);
        --asf-background-heading: var(--background-color-heading);
        --asf-border: var(--background-color-heading);

        display: inline-block;
        border: 1px solid var(--asf-border);
      }
      :host(:focus-within) {
        box-shadow: 0 0 10px var(--color-shadow-primary);
      }
      label {
        font-family: "Signika Negative", "Signika", sans-serif;
        font-size: 16px; /* TODO: variables! ems! */
        line-height: 1.4em;
        font-weight: 700;
        text-align: center;
        color: var(--asf-color-heading);
        background: var(--asf-background-heading);
        width: 100%;
        display: block !important;
        transition: background 333ms ease-in-out,
                    border 333ms ease-in-out,
                    color 333ms ease-in-out;
      }
      .value-pair {
        padding: 4px;
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
      }
      input:focus {
        outline: none;
      }
      .score-field {
      }
      .modifier-field {
        border-left: 1px solid var(--asf-border);
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

    valuePairContainer.append(
      ...[this.#scoreInput as Node, this.#modifierInput as Node].filter(
        (n) => !!n
      )
    );

    this.#shadowRoot.append(this.#label as Node, valuePairContainer);
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
