/**
 * The base component class
 */
export default class BaseComponent extends HTMLElement {
  /**
   * This component's constructed stylesheets.
   *
   * @returns An array of `CSSStyleSheet`s to be attached to the Shadow DOM
   */
  static get styles(): CSSStyleSheet[] {
    return [];
  }

  /**
   * The HTML template to render in the component's shadow DOM.
   * 
   * **Note**: If you're using VSCode, install the `es6-string-html` extension
   * to get syntax highlighting in these templates! Example:
   * 
   * ```js
   * return // html
   * `
   *   <div>Your Template</div>
   * `
   * ```
   */
  protected get template() {
    return "";
  }

  /**
   * The HTML template to render in the component's light DOM.
   * 
   * **Note**: If you're using VSCode, install the `es6-string-html` extension
   * to get syntax highlighting in these templates! Example:
   * 
   * ```js
   * return // html
   * `
   *   <div>Your Template</div>
   * `
   * ```
   */
  protected get lightTemplate() {
    return "";
  }

  /**
   * Prepare any data ahead of rendering the component.
   * 
   * Typically, this will be things like fetching a Document with its UUID.
   */
  protected async prepareData() {}

  /**
   * Bind any events here after the component is rendered here.
   */
  protected events() {}

  /**
   * Is this component associated to a form?
   *
   * A must when trying to use a component to update a Foundry document!
   */
  static formAssociated = true;

  /**
   * Should this component use the light DOM instead of the shadow DOM?
   *
   * Necessary to get Foundry to tab between fields while making changes!
   */
  static isLight = false;

  /**
   * Does this component expose its DOM to outside contexts?
   */
  static shadowMode: ShadowRootMode = "open";

  /**
   * Does this component delegate focus to the Shadow DOM?
   */
  static delegatesFocus = true;

  // ---------------------------------------------------------------------
  // INFRASTRUCTURE STUFF BELOW -- PROBABLY DON'T CHANGE IT IN A COMPONENT
  // ---------------------------------------------------------------------

  /**
   * The root of this component's shadow DOM.
   */
  shadowRoot: ShadowRoot | null = null;

  /**
   * The element's internals, containing useful tools for interacting with forms and validation
   */
  protected internals: ElementInternals;

  constructor() {
    super();
    if (!(this.constructor as typeof BaseComponent).isLight)
      this.shadowRoot = this.attachShadow({
        mode: (this.constructor as typeof BaseComponent).shadowMode,
        delegatesFocus: (this.constructor as typeof BaseComponent).delegatesFocus,
      });
    this.internals = this.attachInternals();
  }

  /**
   * Fires when the component is mounted to the DOM, and whenever it sees changes.
   */
  async connectedCallback() {
    await this.prepareData();
    if ((this.constructor as typeof BaseComponent).formAssociated)
      this.value = this.getAttribute("value")?.toString() || "";
    if (this.shadowRoot)
      this.shadowRoot.adoptedStyleSheets = (this.constructor as typeof BaseComponent).styles;
    if (this.shadowRoot)
      this.shadowRoot.innerHTML = this.template;
    if (this.lightTemplate) {
      const template = document.createElement('template');
      template.innerHTML = this.lightTemplate;
      this.appendChild(template.content);
    }
    this.events();
  }

  /**
   * The component's value, from its attributes.
   */
  get value() {
    return this.getAttribute("value") || "";
  }

  /**
   * Set the component's value on its internals and in its attributes,
   * then tell the containing Sheet that we're ready to update.
   *
   * @param newValue - The new value that we'll use to update the component's value.
   */
  set value(newValue) {
    // @ts-expect-error - this.constructor is of type Function,
    //                     but refers to the inheritor's class,
    //                     which has static members like formAssociated
    if (!this.constructor.formAssociated)
      return;

    // this.setAttribute("value", newValue);
    // this.internals?.setFormValue(newValue);
    // this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  get name() {
    return this.getAttribute("name") || "";
  }

  static localize(s: string) {
    return game.i18n.localize(s);
  }

  static format(s: string, options: Record<string, unknown>) {
    return game.i18n.format(s, options);
  }
}