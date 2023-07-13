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

  get #template() {
    const template: HTMLTemplateElement = document.createElement("template");
    template.innerHTML = `
    <header part="heading">
      <slot name="heading"></slot>
    </header>
    <main part="content">
      <slot name="content">
        <p class="empty">${game.i18n.localize("OSE.table.treasure.noItems")}</p>
      </slot>
    </main>
    `;
    return template;
  }

  #render() {
    this.#shadowRoot.append(document.importNode(this.#template.content, true));
  }
}

customElements.define("labeled-section", LabeledSection);
