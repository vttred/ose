/**
 * Add a component to the custom element registry.
 * 
 * @param name - The component name
 * @returns 
 */
export function component(name: string) {
  if (!name) throw new Error('The `component` decorator requires a name to be added to the custom element registry')
  
  return function(cls: CustomElementConstructor, ctx: { kind: string }) {
    // if (ctx?.kind !== 'class')
    // if (cls.prototype.name !== 'BaseComponent')
    //   throw new Error('The `component` decorator should be used before your class definition.');

    customElements.define(name, cls);
  }
}
