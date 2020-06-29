import { OseActor } from "./entity.js";

export class OseActorSheet extends ActorSheet {
    constructor(...args) {
      super(...args);
    }
    /* -------------------------------------------- */
  
    // Override to set resizable initial size
    async _renderInner(...args) {
      const html = await super._renderInner(...args);
      this.form = html[0];
  
      // Resize resizable classes
      let resizable = html.find('.resizable');
      if (resizable.length == 0) {
        return;
      }
      resizable.each((_, el) => {
        let heightDelta = this.position.height - (this.options.height);
        el.style.height = `${heightDelta + parseInt(el.dataset.baseSize)}px`;
      });
      return html;
    }
    
    async _onResize(event) {
      super._onResize(event);
      let html = $(event.path);
      let resizable = html.find('.resizable');
      resizable.each((_, el) => {
        let heightDelta = this.position.height - (this.options.height);
        el.style.height = `${heightDelta + parseInt(el.dataset.baseSize)}px`;
      });
    }
}