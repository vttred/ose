/**
 * Add a component to the custom element registry.
 * 
 * @param name - The component name
 * @returns 
 */
export function component(name: string) {
  if (!name) throw new Error('The `component` decorator requires a name to be added to the custom element registry')
  
  return function(cls: CustomElementConstructor, ctx: { kind: string }) {
    customElements.define(name, cls);
  }
}
