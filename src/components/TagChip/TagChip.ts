/**
 * @file A custom element that represents item that can be clicked or summon a tooltip
 */
import BaseElement from "../_BaseElement";
// @ts-expect-error
import styles from './TagChip.css' assert { type: "css" };
import { component } from "../decorators";

@component('uft-tag-chip')
export default class TagChip extends BaseElement {
  static get styles() {
    return [styles];
  }

  get template() {
    return /*html*/ `
      <slot></slot>
    `;
  }
}

