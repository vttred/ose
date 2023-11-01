/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "../_BaseElement";
// @ts-expect-error
import styles from './CharacterAbilityField.css' assert { type: "css" };
import { component } from "../decorators";

@component('uft-character-ability-field')
export default class CharacterAbilityField extends BaseElement {
  static get styles() {
    return [styles];
  }

  protected events(): void {
    this.shadowRoot
      .querySelector(".score-field")
      ?.addEventListener("change", (e) => {
        this.onInput(e);
      });
    this.shadowRoot
      .querySelector("label")
      ?.addEventListener("click", (e) => {
        const evt = new Event("roll") as Event & {metaKey: boolean, ctrlKey: boolean};
        evt.metaKey = e.metaKey;
        evt.ctrlKey = e.ctrlKey;
        this.dispatchEvent(evt);
      })
  }

  get template() {
    return /*html*/ `
    <label for="${this.id}">
      <slot name="icon"></slot>
      <span>
        <slot></slot>
      </span>
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
