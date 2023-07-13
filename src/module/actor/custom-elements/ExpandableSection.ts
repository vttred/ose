/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import BaseElement from "./_BaseElement";
import LabeledSection from "./LabeledSection";
// @ts-expect-error
import styles from './ExpandableSection.css' assert { type: "css" };
import OseActor from "../entity";

export default class ExpandableSection extends BaseElement {
  static get styles() {
    return styles;
  }
  
  /**
   * @todo This could reasonably live on OSEItem.
   */
  static get availableTypes() {
    return Object.keys(CONFIG.Item.typeLabels);
  }

  #shadowRoot: ShadowRoot;

  owner?: OseActor;

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    super.connectedCallback();
    // @todo return "borked" state if we can't get the item?
    if (this.closest("form[data-uuid]"))
      this.owner = (await fromUuid((this.closest("form[data-uuid]") as HTMLFormElement)?.dataset?.uuid || '') as OseActor & {system: Record<string, any>});
    this.#render();
    this.#shadowRoot.adoptedStyleSheets = [LabeledSection.styles, ExpandableSection.styles];
  }

  get #type() {
    return this.getAttribute("type") || null;
  }

  get #canCreate() {
    return this.hasAttribute("can-create") && this.#type && ExpandableSection.availableTypes.includes(this.#type);
  }

  // eslint-disable-next-line class-methods-use-this
  get #heading() {
    const heading: HTMLElement = document.createElement("header");
    const expandButton: HTMLElement = document.createElement("button");
    const slot: HTMLSlotElement = document.createElement("slot");

    heading.setAttribute("part", "heading");
    slot.setAttribute("name", "heading");
    expandButton.textContent = "Expand";

    const headingParts = [
      this.#expandButton,
      slot,
      this.#addButton
    ].filter(n => !!n);

    heading.append(...headingParts as Node[]);
    heading.addEventListener("click", this.#onToggle.bind(this));

    return heading;
  }

  get #addButton() {
    if (!this.#canCreate || !this.#type) return null;
    const button: HTMLButtonElement = document.createElement("button");
    const translatedTypeLabel = game.i18n.localize(`TYPES.Item.${this.#type}`);
    const buttonLabel = game.i18n.format(
      "OSE.UI.addItem", 
      { type:  translatedTypeLabel }
    )

    button.setAttribute("aria-label", buttonLabel);
    button.addEventListener("click", this.#onAdd.bind(this));
    button.classList.add("add");

    return button;
  }

  get #expandButton() {
    const button: HTMLButtonElement = document.createElement("button");
    const translatedTypeLabel = this.#type
      ? game.i18n.localize(`TYPES.Item.${this.#type}`)
      : "";
    const buttonLabel = game.i18n.format(
      "OSE.UI.expand", 
      { type:  translatedTypeLabel }
    )
    button.setAttribute("aria-label", buttonLabel);
    button.classList.add("expand");

    return button;
  }

  // eslint-disable-next-line class-methods-use-this
  get #main() {
    const main: HTMLElement = document.createElement("main");
    const collapsible: HTMLDivElement = document.createElement("div");
    const slot: HTMLSlotElement = document.createElement("slot");
    const slotDefault: HTMLParagraphElement = document.createElement("p");

    main.setAttribute("part", "content");
    slot.setAttribute("name", "content");
    slotDefault.classList.add("empty");
    slotDefault.textContent = game.i18n.localize("OSE.table.treasure.noItems");
    collapsible.classList.add("collapsable");

    slot.append(slotDefault);
    main.append(slot);
    collapsible.append(main);

    return collapsible;
  }

  #onToggle() {
    this.toggleAttribute("aria-expanded");
  }

  /**
   * Let the sheet determine what creating an item means
   */
  #onAdd(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(new Event("create", { bubbles: true }))
  }

  #render() {
    this.#shadowRoot.append(this.#heading, this.#main);
  }
}

customElements.define("expandable-section", ExpandableSection);
