/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "../_BaseElement";
// @ts-expect-error
import styles from "./CharacterInfoField.css" assert { type: "css" };
import { component } from "../decorators";

@component('uft-character-info-field')
export default class CharacterInfoField extends BaseElement {
  static get styles() {
    return [styles];
  }

  protected events() {
    this.shadowRoot
      ?.querySelector(".score-field")
      ?.addEventListener("change", (e) => {
        this.onInput(e);
      });
  }

  get template() {
    return /*html*/ `
    <label for="${this.id}">
      <slot></slot>
    </label>
    <input 
      type="text" 
      name="${this.getAttribute('name') || ''}" 
      id="${this.getAttribute('id') || ''}" 
      autocomplete="off" 
      value="${this.getAttribute('value')?.toString() || ''}" 
      class="field score-field" 
      ${this.hasAttribute('readonly') ? 'readonly' : ''} 
      ${this.hasAttribute('disabled') ? 'disabled' : ''}
    />`;
  }

  onInput(e: Event) {
    this.value = (e.target as HTMLInputElement).value || "";
  }
}

