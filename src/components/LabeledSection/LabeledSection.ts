/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "../_BaseElement";
// @ts-expect-error
import styles from './LabeledSection.css' assert { type: "css" };
import { component } from "../decorators";

@component('uft-labeled-section')
export default class LabeledSection extends BaseElement {
  static get styles() {
    return [styles];
  }

  get template() {
    return /*html*/ `
    <header part="heading">
      <slot name="heading"></slot>
    </header>
    <main part="content">
      <slot name="content">
        <p class="empty">${LabeledSection.localize("OSE.table.treasure.noItems")}</p>
      </slot>
    </main>
    `;
  }
}

