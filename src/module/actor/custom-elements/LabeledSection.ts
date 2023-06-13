/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";

export default class LabeledSection extends BaseElement {
  static get styles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host {
        --ls-color-heading: var(--color-heading);
        --ls-background-heading: var(--background-color-heading);
        --ls-border: var(--background-color-heading);

        display: block;
        border: 1px solid var(--ls-border);
      }
      :host([unbordered]) {
        border: none;
      }
      header {
        font-family: "Signika Negative", "Signika", sans-serif;
        font-size: 16px; /* TODO: variables! ems! */
        line-height: 1.5em;
        font-weight: 700;
        text-align: center;
        color: var(--ls-color-heading);
        background: var(--ls-background-heading);
        width: 100%;
        display: block !important;
        transition: background 333ms ease-in-out,
                    border 333ms ease-in-out,
                    color 333ms ease-in-out;
      }
      header ::slotted(*) {
        font-weight: inherit !important;
        font-size: inherit !important;
        display: contents;
      }
      main {
        padding: var(--content-padding, 8px);
      }
      .empty {
        font-style: italic;
        color: var(--color-secondary);
        text-align: center;
        margin: 0;
        padding: 0;
      }
      .
    `);

    return styles;
  }

  #shadowRoot: ShadowRoot;

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    super.connectedCallback();
    this.#render();
    this.#shadowRoot.adoptedStyleSheets = [LabeledSection.styles];
  }

  // eslint-disable-next-line class-methods-use-this
  get #heading() {
    const heading: HTMLElement = document.createElement("header");

    const slot: HTMLSlotElement = document.createElement("slot");
    slot.setAttribute("name", "heading");

    heading.append(slot);

    return heading;
  }

  // eslint-disable-next-line class-methods-use-this
  get #main() {
    const main: HTMLElement = document.createElement("main");
    const slot: HTMLSlotElement = document.createElement("slot");
    const slotDefault: HTMLParagraphElement = document.createElement("p");

    slot.setAttribute("name", "content");

    slotDefault.classList.add("empty");
    slotDefault.textContent = game.i18n.localize("OSE.table.treasure.noItems");

    slot.append(slotDefault);
    main.append(slot);

    return main;
  }

  #render() {
    this.#shadowRoot.append(this.#heading, this.#main);
  }
}

customElements.define("labeled-section", LabeledSection);
