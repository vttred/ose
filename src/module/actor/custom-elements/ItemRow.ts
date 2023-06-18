/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import OseItem from "../../item/entity";
import BaseElement from "./_BaseElement";
// @ts-expect-error
import styles from "./ItemRow.css" assert { type: "css" };

export default class ItemRow extends BaseElement {
  static get styles() {
    return styles;
  }

  static get contextMenu() {
    return {};
  }

  item: OseItem & {system: Record<string, any>} | null = null;

  #shadowRoot: ShadowRoot;

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    super.connectedCallback();

    // @todo return "borked" state if we can't get the item?
    if (this.getAttribute("uuid"))
      this.item = (await fromUuid(this.getAttribute("uuid") as string)) as OseItem & {system: Record<string, any>};

    await this.#render();
    this.draggable = true;
    this.#shadowRoot.adoptedStyleSheets = [ItemRow.styles];
    this.#shadowRoot
      .querySelector(".icon")
      ?.addEventListener("click", this.#onRoll.bind(this));
    this.#shadowRoot
      .querySelector(".favorite")
      ?.addEventListener("click", this.#onFavorite.bind(this));
    this.#shadowRoot
      .querySelector(".equip")
      ?.addEventListener("click", this.#onEquip.bind(this));
    this.#shadowRoot
      .querySelector(".edit")
      ?.addEventListener("click", this.#onEdit.bind(this));
    this.#shadowRoot
      .querySelector(".delete")
      ?.addEventListener("click", this.#onDelete.bind(this));
    this.addEventListener("dragstart", this.#onDrag.bind(this))
  }

  #onDrag(e: DragEvent) {
    if (!this.item) {
      e.stopPropagation();
      return;
    }
    // @ts-expect-error - toDragData isn't picked up by TS types
    const dragData = this.item.toDragData();
    e.dataTransfer.setDragImage(this.#shadowRoot.querySelector('.icon'), 0, 0);
    e.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
  }


  #onRoll(e: Event) {
    e.stopPropagation();
    if (!this.item) return;
    this.item.roll();
  }

  #onFavorite(e: Event) {
    e.stopPropagation();
    if (!this.item) return;

    const favoriteItemKey = "favorite-items";

    const owner = this.item.parent;
    const ownerFavorites =
      (owner?.getFlag(game.system.id, favoriteItemKey) as string[]) || [];
    // eslint-disable-next-line consistent-return
    return !ownerFavorites || !ownerFavorites.includes(this.item.uuid)
      ? owner?.setFlag(game.system.id, favoriteItemKey, [
          ...ownerFavorites,
          this.item.uuid,
        ])
      : owner?.setFlag(
          game.system.id,
          favoriteItemKey,
          ownerFavorites.filter((i) => i !== this.item?.uuid)
        );
  }

  #onEquip(e: Event) {
    e.stopPropagation();
    if (!this.item) return;
    this.item?.update({
      "system.equipped": !this.item.system.equipped,
    });
  }

  #onEdit(e: Event) {
    e.stopPropagation();
    if (!this.item) return;
    this.item?.sheet?.render(true);
  }

  #onDelete(e: Event) {
    e.stopPropagation();
    if (!this.item) return;
    this.item?.delete();
  }

  // weight
  // description

  get #icon() {
    const icon: HTMLImageElement = document.createElement("img");
    icon.setAttribute("class", "icon");
    icon.setAttribute("src", this.item?.img || "");
    icon.setAttribute("alt", this.item?.name || "");
    return icon;
  }

  get #itemName() {
    const name: HTMLSpanElement = document.createElement("span");
    name.setAttribute("class", "item-name");
    name.textContent = this.item?.name || "";
    name.addEventListener("click", (e) => {
      this.toggleAttribute("aria-expanded");
    })
    return name;
  }

  get #favoriteButton() {
    if (!this.hasAttribute("can-favorite")) return null;

    const button: HTMLButtonElement = document.createElement("button");
    button.classList.add("favorite");
    if (this.item?.system.favorited) button.classList.add("favorite--enabled");
    button.textContent = "Fav.";

    return button;
  }

  get #equipButton() {
    if (!this.hasAttribute("can-equip")) return null;

    const button: HTMLButtonElement = document.createElement("button");
    button.classList.add("equip");
    if (this.item?.system.equipped) button.classList.add("equip--enabled");
    button.textContent = "Eqp.";

    return button;
  }

  get #showChatButton() {
    if (!this.hasAttribute("can-show-chat")) return null;

    const button: HTMLButtonElement = document.createElement("button");
    button.classList.add("show-chat");
    button.textContent = "Show";

    return button;
  }

  // eslint-disable-next-line class-methods-use-this
  get #editButton() {
    const button: HTMLButtonElement = document.createElement("button");
    button.classList.add("edit");
    button.textContent = "Edit";

    return button;
  }

  // eslint-disable-next-line class-methods-use-this
  get #deleteButton() {
    const button: HTMLButtonElement = document.createElement("button");
    button.classList.add("delete");
    button.textContent = "Del.";

    return button;
  }

  get #controls() {
    const container: HTMLDivElement = document.createElement("div");
    const controls = [
      this.#equipButton,
      this.#showChatButton,
      this.#favoriteButton,
      this.#editButton,
      this.#deleteButton,
    ].filter((n) => !!n);

    container.append(...(controls as Node[]));
    container.classList.add("controls");

    return container;
  }

  // eslint-disable-next-line class-methods-use-this
  get #content() {
    const content: HTMLElement = document.createElement("div");
    const collapsible: HTMLDivElement = document.createElement("div");
    const slot: HTMLSlotElement = document.createElement("slot");

    content.setAttribute("part", "content");
    collapsible.classList.add("collapsable");

    content.append(slot);
    collapsible.append(content);

    return collapsible;
  }

  get #row() {
    const container: HTMLDivElement = document.createElement("div");
    container.append(this.#icon, this.#itemName, this.#controls);
    container.classList.add("row");
    container.addEventListener("dragstart", this.#onDrag.bind(this));
    return container;
  }
  
  async #render() {
    this.#shadowRoot.append(this.#row, this.#content);
  }
}

customElements.define("item-row", ItemRow);
