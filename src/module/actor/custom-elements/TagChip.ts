/**
 * @file A custom element that represents item that can be clicked or summon a tooltip
 */
import BaseElement from "./_BaseElement";
// @ts-expect-error
import styles from './TagChip.css' assert { type: "css" };

export default class TagChip extends BaseElement {
  static get styles() {
    return styles;
  }

  #shadowRoot: ShadowRoot;

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    super.connectedCallback();

    await this.#render();
    this.#shadowRoot.adoptedStyleSheets = [TagChip.styles];
  }

  get #template() {
    const template: HTMLTemplateElement = document.createElement("template");

    template.innerHTML = `
      <slot></slot>
    `;

    return template;
  }

  async #render() {
    this.#shadowRoot.append(document.importNode(this.#template.content, true))
  }
}

customElements.define("tag-chip", TagChip);
