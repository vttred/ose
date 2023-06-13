/**
 * @file A custom element that represents item that can be clicked or summon a tooltip
 */
import BaseElement from "./_BaseElement";

export default class TippableItem extends BaseElement {
  static get styles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host {
        display: grid;
        grid-template-columns: 32px 1fr;
        align-items: center;
        grid-gap: 8px;
      }
      :host(:focus) {
        outline: none;
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
    if (this.getAttribute("uuid"))
      this.item = (await fromUuid(this.getAttribute("uuid") as string)) as Item;

    this.setAttribute("title", this.item.name);
    this.setAttribute("tabindex", "0");

    await this.#render();
    this.#shadowRoot.adoptedStyleSheets = [TippableItem.styles];
    this.addEventListener("pointerdown", this.#onRoll.bind(this));
    this.addEventListener("keydown", this.#onRoll.bind(this));
  }

  #onRoll(e: KeyboardEvent | PointerEvent) {
    // Bail if we don't have an item to roll
    if (!this.item) return;
    // Bail if the user uses a keyboard and doesn't use Enter or Space to activate
    if (e instanceof KeyboardEvent && e.key !== "Enter" && e.key !== " ")
      return;
    // Bail if the user doesn't left click to activate
    // (so we can use right click for a context menu)
    if (e instanceof PointerEvent && e.button !== 1) return;

    this.item.roll();
  }

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

  async #render() {
    this.#shadowRoot.append(this.#icon, this.#itemName);
  }

  onInput(e: Event) {
    // const oldValue = parseInt(this.getAttribute("value") || "", 10);
    const newValue = (e.target as HTMLInputElement).value || "";

    // if (newValue < 0) newValue = 0;
    super.setValue(newValue);
  }
}

customElements.define("tippable-item", TippableItem);
