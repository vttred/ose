/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";
// @ts-expect-error
import styles from './LabeledSection.css' assert { type: "css" };

export default class LabeledSection extends BaseElement {
  static get styles() {
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

    heading.setAttribute("part", "heading");
    slot.setAttribute("name", "heading");

    heading.append(slot);

    return heading;
  }

  // eslint-disable-next-line class-methods-use-this
  get #main() {
    const main: HTMLElement = document.createElement("main");
    const slot: HTMLSlotElement = document.createElement("slot");
    const slotDefault: HTMLParagraphElement = document.createElement("p");

    main.setAttribute("part", "content");
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
