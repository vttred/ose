/**
 * @file A custom element that represents an Ability Score and its modifier
 */
import { dom, icon } from "@fortawesome/fontawesome-svg-core";
import { faWeightHanging, faTrash, faEye, faStar, faEdit, faShirt, faEyeSlash, faScroll, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import OseItem from "../../module/item/entity";
import BaseElement from "../_BaseElement";
// @ts-expect-error
import styles from "./ItemRow.css" assert { type: "css" };
import { abbreviateNumber } from "../../module/helpers-numbers";
import { component } from "../decorators";

@component('uft-item-row')
export default class ItemRow extends BaseElement {
  static get styles() {
    const iconSheet = new CSSStyleSheet();
    iconSheet.replaceSync(dom.css());
    return [styles, iconSheet];
  }

  static formAssociated = false;
  static delegatesFocus = false;
  static shadowMode:ShadowRootMode = "closed";

  static get contextMenu() {
    return {};
  }

  item: OseItem & {system: Record<string, any>} | null = null;

  protected async prepareData(): Promise<void> {
    if (this.getAttribute("uuid"))
      this.item = (await fromUuid(this.getAttribute("uuid") as string)) as OseItem & {system: Record<string, any>};    
  }

  protected events(): void {
    this.#bindSystemEvents();
    this.#bindModuleIntegrationEvents();
  }

  #bindSystemEvents() {
    this.tabIndex = 0;
    this.setAttribute('draggable', 'true');
    
    this.addEventListener("dragstart", this.#onDrag.bind(this));

    this.addEventListener("click", this.#onExpand.bind(this));

    // Item thumbnail
    this.shadowRoot
      .querySelector(".icon")
      ?.addEventListener("click", this.#onRoll.bind(this));

    // Right side controls
    this.shadowRoot
      .querySelector(".favorite")
      ?.addEventListener("click", this.#onFavorite.bind(this));
    this.shadowRoot
      .querySelector(".equip")
      ?.addEventListener("click", this.#onEquip.bind(this));
      this.shadowRoot
      .querySelector(".show-chat")
      ?.addEventListener("click", this.#onShow.bind(this));
    this.shadowRoot
      .querySelector(".edit")
      ?.addEventListener("click", this.#onEdit.bind(this));
    this.shadowRoot
      .querySelector(".delete")
      ?.addEventListener("click", this.#onDelete.bind(this));

    // Charges (spell slots)
    this.shadowRoot
      .querySelector(".charge-control--increment")
      ?.addEventListener("click", this.#onAddCharge.bind(this));
    this.shadowRoot
      .querySelector(".charge-control--decrement")
      ?.addEventListener("click", this.#onRemoveCharge.bind(this));
  }

  /**
   * Bind events for integration with modules
   */
  #bindModuleIntegrationEvents() {
    // Forien's Unidentified Items
    this.shadowRoot
      .querySelector(".identify")
      ?.addEventListener("pointerdown", this.#onIdentify.bind(this));
    // @ts-expect-error - TS doesn't seem to realize that PointerEvents
    //                    are dispatched by `pointerdown` events
    this.shadowRoot
      .querySelector(".mystify")
      ?.addEventListener("pointerdown", this.#onMystify.bind(this));
  }

  #onAddCharge(e: Event) {
    e.stopPropagation();
    // The sheet can decide what happens when an increment is requested
    this.dispatchEvent(new Event('charge-increment'));
  }

  #onRemoveCharge(e: Event) {
    e.stopPropagation();
    // The sheet can decide what happens when a decrement is requested
    this.dispatchEvent(new Event('charge-decrement'));
  }

  #onExpand(e: Event) {
    const slot = this.shadowRoot.querySelector('slot:not([name])') as HTMLSlotElement;
    const nodes = slot
      ?.assignedNodes()
      ?.filter((node: Node) => node.nodeType === Node.ELEMENT_NODE)
    // @ts-expect-error - e.target could be one of this component
    if(!!nodes?.length && e.target?.localName === this.localName)
      this.toggleAttribute("aria-expanded");
  }

  #onDrag(e: DragEvent) {
    if (!this.item) {
      e.stopPropagation();
      return;
    }
    // @ts-expect-error - toDragData isn't picked up by TS types
    const dragData = this.item.toDragData();
    if (!!this.shadowRoot.querySelector('.icon'))
      e.dataTransfer?.setDragImage(this.shadowRoot.querySelector('.icon') as Element, 0, 0);
    e.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
  }

  #onShow(e: Event) {
    e.stopPropagation();
    if (!this.item) return;
    this.item.show();
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

  #onMystify(e: PointerEvent) {
    // @ts-expect-error - isMystified is a mutation of the OseItem type
    //                    caused by Forien's Unidentified Items
    if (this.item?.isMystified()) return;

    if (e.ctrlKey || e.metaKey)
    // @ts-expect-error - ForienIdentification is a global
      ForienIdentification.mystifyAdvancedDialog(this.getAttribute("uuid"))  
    else
    // @ts-expect-error - ForienIdentification is a global
      ForienIdentification.mystifyReplace(this.getAttribute("uuid"))
  }

  #onIdentify(_e: Event) {
    // @ts-expect-error - isMystified is a mutation of the OseItem type
    //                    caused by Forien's Unidentified Items
    if (!this.item?.isMystified()) return;
    // @ts-expect-error - ForienIdentification is a global
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

    // @ts-expect-error - game.modules.find does, indeed, work.
    return game.modules.find(m => m.id === "forien-unidentified-items")?.active
  }

  get #identifyButton() {
    if (!this.#canIdentify)
      return '';
    // @ts-expect-error - isMystified is a mutation of the OseItem type
    //                    caused by Forien's Unidentified Items
    if (!this.item?.isMystified())
      return /* html */ `<button class="mystify"
        title="${game.i18n.localize("forien-unidentified-items.Mystify")}"
        aria-label="${game.i18n.localize("forien-unidentified-items.Mystify")}">
        ${icon(faEyeSlash).html}
      </button>`;
    return /* html */ `<button class="identify"
      title="${game.i18n.localize("forien-unidentified-items.Identify")}"
      aria-label="${game.i18n.localize("forien-unidentified-items.Identify")}">
      ${icon(faEye).html}
    </button>`
  }

  get #controls() {
    if (!this.item?.sheet?.isEditable) return '';

    return /* html */ `
    ${this.#identifyButton}
    ${this.hasAttribute("can-equip") 
      ? /* html */ `<button
        class="equip ${this.item?.system.equipped ? "equip--enabled" : ""}"
        title="${game.i18n.localize("OSE.Equip")}"
        aria-label="${game.i18n.localize("OSE.Equip")}">
        ${icon(faShirt).html}
      </button>`
      : ""
    }
    ${this.hasAttribute("can-show-chat") 
      ? /* html */ `<button
        class="show-chat"
        title="${game.i18n.localize("OSE.Show")}"
        aria-label="${game.i18n.localize("OSE.Show")}">
          ${icon(faScroll).html}
        </button>`
      : ""
    }
    ${this.hasAttribute("can-favorite") 
      ? /* html */ `<button
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
    
    return /* html */ `
    <span aria-label="${label}" title="${label}">
      ${icon(faWeightHanging).html}
      ${weight || 0}
    </span>`
  }

  get #chargesLabel() {
    if (!this.hasAttribute('charges')) return '';

    // @ts-expect-error - We're checking for if we have charges above.
    const charges = parseInt(this.getAttribute('charges'), 10);
    const label = "Charges";

    return /*html*/ `
      <span aria-label="${label}" title="${label}" class="charges">
        <button class="charge-control charge-control--decrement" title="Decrease">${icon(faMinus).html}</button>
        ${charges}
        <button class="charge-control charge-control--increment" title="Increase">${icon(faPlus).html}</button>
      </span>
    `;
  }

  get #quantityLabel() {
    if (!this.hasAttribute("has-quantity")) return '';

    let quantity = abbreviateNumber(this.item?.system.quantity.value);
    let max = this.item?.system.quantity.max
      ? `/${this.item?.system.quantity.max}`
      : ""
    return /* html */ `<uft-tag-chip class="quantity">
      ${quantity}${max}
    </uft-tag-chip>`;
  }

  /**
   * @TODO Where does carry weight fit in here?
   */
  get template() {
    return /*html*/ `
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
            ${this.#chargesLabel}
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
  }
}
