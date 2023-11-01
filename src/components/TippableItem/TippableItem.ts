/**
 * @file A custom element that represents item that can be clicked or summon a tooltip
 */
import BaseElement from "../_BaseElement";
// @ts-expect-error
import styles from './TippableItem.css' assert { type: "css" };
import OseItem from "../../module/item/entity";
import { component } from "../decorators";

@component('uft-tippable-item')
export default class TippableItem extends BaseElement {
  static get styles() {
    return [styles];
  }

  static get contextMenu() {
    return [{ 
      name: 'Share in Chat',
      icon: '<i class="fa fa-eye"></i>', 
      callback: (node: JQuery<HTMLElement>) => {
        const { item } = node[0] as TippableItem;
        item?.show();
      }
    },
    { 
      name: 'Attack',
      icon: '<i class="fa fa-edit"></i>', 
      condition: (node: JQuery<HTMLElement>) => {
        const { item } = node[0] as TippableItem;
        return !!(item && item.type === "weapon");
      },
      callback: (node: JQuery<HTMLElement>) => {
        const { item } = node[0] as TippableItem;
        item?.roll();
      }
    },
    { 
      name: 'Edit',
      icon: '<i class="fa fa-edit"></i>', 
      condition: (node: JQuery<HTMLElement>) => {
        const { item } = node[0] as TippableItem;
        return !!item?.isOwner;
      },
      callback: (node: JQuery<HTMLElement>) => {
        const { item } = node[0] as TippableItem;
        item?.sheet?.render(true);
      }
    },
    {
      name: 'Delete',
      icon: '<i class="fa fa-trash"></i>', 
      condition: (node: JQuery<HTMLElement>) => {
        const { item } = node[0] as TippableItem;
        return !!item?.isOwner;
      },
      callback: (node: JQuery<HTMLElement>) => {
        const { item } = node[0] as TippableItem;
        item?.deleteDialog();
      }
    }];
  }

  item: OseItem | null = null;

  contextMenu?: unknown;

  protected async prepareData(): Promise<void> {
    // @todo return "borked" state if we can't get the item?
    if (this.getAttribute("uuid"))
      this.item = (await fromUuid(this.getAttribute("uuid") as string)) as OseItem;

    this.setAttribute("title", this.item?.name || '');
    this.setAttribute("tabindex", "0");
  }

  protected events(): void {
    this.setAttribute("draggable", "true");
    
    this.addEventListener("pointerdown", this.#onRoll.bind(this));
    this.addEventListener("keydown", this.#onRoll.bind(this));

    this.contextMenu = new ContextMenu(
      $(this),
      this.localName,
      TippableItem.contextMenu
    )
  }

  #onRoll(e: KeyboardEvent | PointerEvent) {
    // Bail if we don't have an item to roll
    if (!this.item) return;
    // Bail if the user uses a keyboard and doesn't use Enter or Space to activate
    if (e instanceof KeyboardEvent && e.key !== "Enter" && e.key !== " ")
      return;
    // Bail if the user doesn't left click to activate
    // (so we can use right click for a context menu)
    if (e instanceof PointerEvent && e.button === 2) return;

    this.item.roll();
  }

  get template() {
    return /*html*/ `
      <img class="icon" src="${this.item?.img || ""}" alt="${this.item?.name || ""}" />
      <span class="item-name">${this.item?.name || ""}</span>
      <slot></slot>
    `;
  }

  get uuid() {
    return this.getAttribute("uuid");
  }

  onInput(e: Event) {
    this.value = (e.target as HTMLInputElement).value || "";
  }
}

