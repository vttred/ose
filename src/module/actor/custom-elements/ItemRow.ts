/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import { config, dom, icon } from "@fortawesome/fontawesome-svg-core";
import { faWeightHanging, faTrash, faEye, faStar, faEdit, faShirt, faEyeSlash, faScroll } from "@fortawesome/free-solid-svg-icons";
import OseItem from "../../item/entity";
import BaseElement from "./_BaseElement";
// @ts-expect-error
import styles from "./ItemRow.css" assert { type: "css" };
import { abbreviateNumber } from "../../helpers-numbers";

config.autoAddCss = false;

export default class ItemRow extends BaseElement {
  static get styles() {
    const iconSheet = new CSSStyleSheet();
    iconSheet.replaceSync(dom.css());
    return [styles, iconSheet];
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
    this.#shadowRoot.adoptedStyleSheets = [...ItemRow.styles];
    
    this.#bindSystemEvents();
    this.#bindModuleIntegrationEvents()  
  }

  #bindSystemEvents() {
    this.addEventListener("click", this.#onExpand.bind(this));
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
    this.addEventListener("dragstart", this.#onDrag.bind(this));
  }

  #bindModuleIntegrationEvents() {
    // Forien's Unidentified Items
    this.#shadowRoot
      .querySelector(".identify")
      ?.addEventListener("click", this.#onIdentify.bind(this));
    this.#shadowRoot
      .querySelector(".mystify")
      ?.addEventListener("click", this.#onMystify.bind(this));
  }

  #onExpand(e: Event) {
    const slot = this.#shadowRoot.querySelector('slot:not([name])');
    const nodes = slot
      ?.assignedNodes()
      ?.filter(node => node.nodeType === Node.ELEMENT_NODE)
    if(!!nodes?.length && e.target.localName === "item-row")
      this.toggleAttribute("aria-expanded");
  }

  #onDrag(e: DragEvent) {
    if (!this.item) {
      e.stopPropagation();
      return;
    }
    // @ts-expect-error - toDragData isn't picked up by TS types
    const dragData = this.item.toDragData();
    if (!!this.#shadowRoot.querySelector('.icon'))
      e.dataTransfer?.setDragImage(this.#shadowRoot.querySelector('.icon') as Element, 0, 0);
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
    this.item?.deleteDialog();
  }

  #onMystify(e: Event) {
    // @ts-expect-error - isMystified is a mutation of the OseItem type
    //                    caused by Forien's Unidentified Items
    if (this.item?.isMystified()) return;

    if (e.ctrlKey || e.metaKey)
      ForienIdentification.mystifyAdvancedDialog(this.getAttribute("uuid"))  
    else
      ForienIdentification.mystifyReplace(this.getAttribute("uuid"))
  }

  #onIdentify(e: Event) {
    // @ts-expect-error - isMystified is a mutation of the OseItem type
    //                    caused by Forien's Unidentified Items
    if (!this.item?.isMystified()) return;
    ForienIdentification.identify(this.item)
  }

  /**
   * Can this item be mystified/identified?
   */
  get #canIdentify() {
    if (!game.user?.isGM) return false;
    if (!this.hasAttribute("can-mystify")) return false;
    if (!game.modules.has("forien-unidentified-items")) return false;
    if (!this.item) return false;
    return game.modules
      .find(m => m.id === "forien-unidentified-items")
      .active
  }

  get #identifyButton() {
    if (!this.#canIdentify)
      return '';
    if (!this.item?.isMystified())
      return `<button class="mystify"
        title="${game.i18n.localize("forien-unidentified-items.Mystify")}"
        aria-label="${game.i18n.localize("forien-unidentified-items.Mystify")}">
        ${icon(faEyeSlash).html}
      </button>`;
    return `<button class="identify"
      title="${game.i18n.localize("forien-unidentified-items.Identify")}"
      aria-label="${game.i18n.localize("forien-unidentified-items.Identify")}">
      ${icon(faEye).html}
    </button>`
  }

  get #controls() {
    if (!this.item?.sheet?.isEditable) return '';

    return `
    ${this.#identifyButton}
    ${this.hasAttribute("can-equip") 
      ? `<button
        class="equip ${this.item?.system.equipped ? "equip--enabled" : ""}"
        title="${game.i18n.localize("OSE.Equip")}"
        aria-label="${game.i18n.localize("OSE.Equip")}">
        ${icon(faShirt).html}
      </button>`
      : ""
    }
    ${this.hasAttribute("can-show-chat") 
      ? `<button
        class="show-chat"
        title="${game.i18n.localize("OSE.Show")}"
        aria-label="${game.i18n.localize("OSE.Show")}">
          ${icon(faScroll).html}
        </button>`
      : ""
    }
    ${this.hasAttribute("can-favorite") 
      ? `<button
        class="favorite ${this.item?.system.favorited ? "favorite--enabled" : ""}"
        title="${game.i18n.localize("OSE.Favorite.label")}"
        aria-label="${game.i18n.localize("OSE.Favorite.label")}">
        ${icon(faStar).html}
      </button>`
      : ""
    }
    <button
      class="edit"
      title="${game.i18n.localize("OSE.Edit")}"
      aria-label="${game.i18n.localize("OSE.Edit")}">
      ${icon(faEdit).html}
    </button>
    <button
      class="delete"
      title="${game.i18n.localize("OSE.Delete")}"
      aria-label="${game.i18n.localize("OSE.Delete")}">
      ${icon(faTrash).html}
    </button>`;
  }

  get #weightLabel() {
    if (!this.hasAttribute("has-weight")) return '';

    const name = this.item?.name || '';
    const weight = this.item?.system.quantity.value
      ? (this.item?.system.weight * this.item?.system.quantity.value) || 0
      : this.item?.system.weight || 0;
    const label = game.i18n.format( "OSE.items.WeightLong", { name, weight });
    
    return `
    <span aria-label="${label} title="${label}>
      ${icon(faWeightHanging).html}
      ${weight || 0}
    </span>`
  }

  get #quantityLabel() {
    if (!this.hasAttribute("has-quantity")) return '';

    let quantity = abbreviateNumber(this.item?.system.quantity.value);
    let max = this.item?.system.quantity.max
      ? `/${this.item?.system.quantity.max}`
      : ""
    return `<tag-chip class="quantity">
      ${quantity}${max}
    </tag-chip>`;
  }

  /**
   * @TODO Where does carry weight fit in here?
   */
  get #template() {
    const template: HTMLTemplateElement = document.createElement("template");
    
    template.innerHTML = `
      <div class="row">
        <div class="icon">
          <img src="${this.item?.img || ''}" alt="${this.item?.name || ''}">
          ${this.#quantityLabel}
        </div>
        <div class="name">
          <span class="item-name">${this.item?.name || ''}</span>
          <div part="title-content">
            <slot name="title-content"></slot>
          </div>
        </div>
        <div class="supplemental-content">
          <slot name="supplemental-content">
            ${this.#weightLabel}
          </slot>
        </div>
        <div class="controls">
          ${this.#controls}
        </div>
      </div>
      <div class="collapsable">
        <div part="content">
          <slot></slot>
        </div>
      </div>
      `;
    return template;
  }

  async #render() {
    console.info();
    this.#shadowRoot.append(document.importNode(this.#template.content, true));
  }
}

customElements.define("item-row", ItemRow);
