/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";

export default class InventoryRow extends BaseElement {
  static get styles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host {
        display: grid;
        grid-template-columns: 32px 1fr 1fr;
        align-items: center;
        grid-gap: 16px;
      }
      :host(:focus-within) {
        box-shadow: 0 0 10px var(--color-shadow-primary);
      }
      .icon {
        display: block;
        width: 100%;
        height: auto;
      }
      :host :last-child {
        justify-self: self-end;
      }
      .
    `);

    return styles;
  }

  static get contextMenu() {
    return {};
  }

  item: Item | null = null;

  #shadowRoot: ShadowRoot;

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    super.connectedCallback();

    // @todo return "borked" state if we can't get the item?
    if (this.getAttribute("id"))
      this.item = (await fromUuid(this.getAttribute("id") as string)) as Item;

    await this.#render();
    this.#shadowRoot.adoptedStyleSheets = [InventoryRow.styles];
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
  }

  #onFavorite() {
    if (!this.item) return;;

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
          ownerFavorites.filter((i) => i !== this.item.uuid)
        );
  }

  #onEquip() {
    this.item?.update({
      "system.equipped": !this.item.system.equipped,
    });
  }

  #onEdit() {
    this.item?.sheet?.render(true);
  }

  #onDelete() {
    this.item?.delete();
  }

  // get item() {
  //   return fromUuidSync()
  // }

  // weight
  // equip/carry
  // favorite
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
    const controlContainer: HTMLDivElement = document.createElement("div");
    const controls = [
      this.#equipButton,
      this.#showChatButton,
      this.#favoriteButton,
      this.#editButton,
      this.#deleteButton,
    ].filter((n) => !!n);

    controlContainer.append(...(controls as Node[]));

    return controlContainer;
  }

  async #render() {
    this.#shadowRoot.append(this.#icon, this.#itemName, this.#controls);
  }

  onInput(e: Event) {
    // const oldValue = parseInt(this.getAttribute("value") || "", 10);
    const newValue = (e.target as HTMLInputElement).value || "";

    // if (newValue < 0) newValue = 0;
    super.setValue(newValue);
  }
}

customElements.define("inventory-row", InventoryRow);
