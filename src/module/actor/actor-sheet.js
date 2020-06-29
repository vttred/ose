import { OseActor } from "./entity.js";
import { OseEntityTweaks } from "../dialog/entity-tweaks.js";

export class OseActorSheet extends ActorSheet {
    constructor(...args) {
      super(...args);
    }
    /* -------------------------------------------- */
  
    activateListeners(html) {
      html.find('.saving-throw .attribute-name a').click(ev => {
        let actorObject = this.actor;
        let element = event.currentTarget;
        let save = element.parentElement.parentElement.dataset.save;
        actorObject.rollSave(save, { event: event });
      })

      super.activateListeners(html);
    }

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

    
    _onConfigureActor(event) {
      event.preventDefault();
      new OseEntityTweaks(this.actor, {
        top: this.position.top + 40,
        left: this.position.left + (this.position.width - 400) / 2,
      }).render(true);
    }

    /**
     * Extend and override the sheet header buttons
     * @override
     */
    _getHeaderButtons() {
      let buttons = super._getHeaderButtons();
  
      // Token Configuration
      const canConfigure = game.user.isGM || this.actor.owner;
      if (this.options.editable && canConfigure) {
        buttons = [
          {
            label: 'Tweaks',
            class: 'configure-actor',
            icon: 'fas fa-dice',
            onclick: (ev) => this._onConfigureActor(ev),
          },
        ].concat(buttons);
      }
      return buttons;
    }
}