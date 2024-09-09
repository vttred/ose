import OSE from "../config";
import { colorGroups } from "./combat-group";

const {
  HandlebarsApplicationMixin,
  ApplicationV2
} = foundry.applications.api;

export default class OSECombatGroupSelector extends HandlebarsApplicationMixin(ApplicationV2) {
  _highlighted;
  
  static DEFAULT_OPTIONS = {
      id: "combat-set-groups-{id}",
      classes: ["combat-set-groups", "scrollable"],
      tag: "form",
      window: {
        frame: true,
        positioned: true,
        title: "OSE.combat.SetCombatantGroups",
        icon: "fa-flag",
        controls: [],
        minimizable: false,
        resizable: true,
        contentTag: "section",
        contentClasses: []
      },
      actions: {},
      form: {
        handler: undefined,
        submitOnChange: true
      },
      position: {
        width: 330,
        height: "auto"
      }
    }

  static PARTS = {
    main: {
      template: `/systems/ose-dev/dist/templates/apps/combat-set-groups.hbs`
    }
  }

  async _prepareContext(_options) {
    return {
      groups: colorGroups,
      combatants: game.combat.combatants,
      // buttons: [{
      //   type: "submit",
      //   icon: "fa-solid fa-save",
      //   label: game.i18n.localize(this.document.id ? "AMBIENT_SOUND.ACTIONS.UPDATE" : "AMBIENT_SOUND.ACTIONS.CREATE")
      // }]
    }
  }

  protected async _updateObject(event: Event): Promise<void> {
    const combatant = game.combat.combatants.get(event.target.name);   
    await combatant.setFlag(game.system.id, "group", event.target.value)
  }

  #onCombatantHoverIn(event) {
    event.preventDefault();
    if ( !canvas.ready ) return;
    const li = event.currentTarget;
    const combatant = game.combat.combatants.get(li.dataset.combatantId);
    const token = combatant.token?.object;
    if ( token?.isVisible ) {
      if ( !token.controlled ) token._onHoverIn(event, {hoverOutOthers: true});
      this._highlighted = token;
    }
  }

  #onCombatantHoverOut(event) {
    event.preventDefault();
    if ( this._highlighted ) this._highlighted._onHoverOut(event);
    this._highlighted = null;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    for ( const li of this.element.querySelectorAll("[data-combatant-id]") ) {
      li.addEventListener("mouseover", this.#onCombatantHoverIn.bind(this));
      li.addEventListener("mouseout", this.#onCombatantHoverOut.bind(this));
    }
    this.element.addEventListener("change", this._updateObject);
  }
}
