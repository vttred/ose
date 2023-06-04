/**
 * @file A custom element that represents an Ability Score and its modifier
 */

/**
 * The base component class
 */
export default class BaseElement extends HTMLElement {
  /**
   * The attributes this component watches for changes in the
   * `attributeChangedCallback` lifecycle event.
   *
   * @returns An array of observed attributes
   */
  static get observedAttributes(): (string | undefined)[] {
    return [];
  }

  /**
   * This component's constructed stylesheet
   *
   * @returns An instance of `CSSStyleSheet` to be attached to `this.#shadowRoot`
   */
  static get styles() {
    return new CSSStyleSheet();
  }

  /**
   * Is this component associated to a form?
   *
   * A must when trying to use a component to update 
   */
  static formAssociated = false;

  /**
   * The root of this component's shadow DOM.
   */
  #shadowRoot: ShadowRoot;

  /**
   * The component's form internals, if they exist.
   */
  #internals: ElementInternals;

  /**
   * The component's name, most likely to be used by Foundry's update flow.
   */
  name: string = "";

  /**
   * The component's value, if one exists.
   */
  value: unknown;

  /**
   * Fires when the component is mounted to the DOM, and whenever it sees changes.
   */
  connectedCallback() {
    if (!this.name) this.name = this.getAttribute("name") || "";
    if (!this.value) this.value = this.getAttribute("value") || "";
    this.#internals?.setFormValue(this.getAttribute("value")?.toString() || "");
  }

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * This method is where the final HTML output for the component should be compiled.
   *
   * Please note: this component will not render output unless this is overridden!
   *
   * @returns An HTMLElement to be attached to the shadow DOM
   */
  // eslint-disable-next-line class-methods-use-this
  #render() {}

  /**
   * Set the component's value, and tell the containing Sheet that we're ready to update.
   *
   * @param newValue - The new value that we'll use to update the component's value.
   */
  setValue(newValue: string = "") {
    this.value = newValue;
    this.setAttribute("value", newValue);
    this.#internals?.setFormValue(newValue);
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }
}
