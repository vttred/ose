/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "../_BaseElement";
// @ts-expect-error
import styles from './MajorIconField.css' assert { type: "css" };
import { component } from "../decorators";

@component('uft-major-icon-field')
export default class MajorIconField extends BaseElement {
  static get styles() {
    return [styles];
  }

  targetName: string = "";

  modifierValue?: number;

  protected async prepareData(): Promise<void> {
    this.setAttribute("data-dtype", "Number");
  }

  protected events(): void {
    this.shadowRoot.querySelector(".score-field")?.addEventListener("change", this.onInput.bind(this));
    this.shadowRoot.querySelector(".max-field")?.addEventListener("change", this.onInput.bind(this));
  }

  get template() {
    const maxField = `
    <input 
      type="text"
      name="${this.getAttribute('max-name') || ''}" 
      value="${this.getAttribute('max')?.toString() || ''}" 
      class="field max-field"
      ${(this.hasAttribute('readonly') || this.hasAttribute('disabled')) ? 'tabindex="-1"' : ''}
      ${this.hasAttribute('readonly') ? 'readonly' : ''}
      ${this.hasAttribute('disabled') ? 'disabled' : ''}
      onchange="this.onInput.bind(this)"
    />
    `;

    return /*html*/ `
    <uft-labeled-section unbordered>
      <label for="${this.id}" slot="heading">
        <slot></slot>
      </label>
      <div class="field-background-container" slot="content">
        <div class="value-pair">
          <input 
            type="text" 
            name="${this.getAttribute('value-name') || ''}" 
            id="${this.getAttribute('id') || ''}" 
            value="${this.getAttribute('value')?.toString() || ''}" 
            class="field score-field"
            ${(this.hasAttribute('readonly') || this.hasAttribute('disabled')) ? 'tabindex="-1"' : ''}
            ${this.hasAttribute('readonly') ? 'readonly' : ''}
            ${this.hasAttribute('disabled') ? 'disabled' : ''}
            onchange="this.onInput.bind(this)"
          />
          ${this.hasAttribute('max') ? maxField : ''}
        </div>
        <slot name="background"></slot>
      </div>
    </uft-labeled-section>`;
  }

  onInput(e: Event) {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value || "";

    if (
      name === this.getAttribute("value-name") &&
      name === this.getAttribute("max-name")
    )
      return;
    
    this.targetName = name;
    this.value = value.toString();
  }
}

