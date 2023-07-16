/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";
// @ts-expect-error
import styles from "./CharacterInfoMeter.css" assert { type: "css" };

export default class CharacterInfoMeter extends BaseElement {
  static get observedAttributes() {
    return ["value", "modifier-value"];
  }

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
    this.#shadowRoot.adoptedStyleSheets = [CharacterInfoMeter.styles];
  }


  get #value() {
    const value = parseInt(this.getAttribute("value") || '');
    if (isNaN(value)) return 0;
    return value;
  }

  get #max() {
    const max = parseInt(this.getAttribute("max") || '');
    if (isNaN(max)) return 100;
    return max;
  }

  get #progress() {
    return (this.#value / this.#max * 100) || 0;
  }

  /**
   * 
   */
  get #template() {
    const template: HTMLTemplateElement = document.createElement("template");
    template.innerHTML = `
    <div class="meter-progress" style="width: ${this.#progress}%"></div>
    <slot></slot>
    <span class="value">${this.getAttribute("value")}/${this.getAttribute("max")}</span>
    `;
    return template;
  }

  #render() {
    this.#shadowRoot.append(document.importNode(this.#template.content, true));
  }
}

customElements.define("character-info-meter", CharacterInfoMeter);
