import { OseDice } from '../dice.js';

export class OseActor extends Actor {
  /**
   * Extends data from base Actor class
   */

   /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
    /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */
  rollSave(save, options = {}) {
    const label = game.i18n.localize(`OSE.saves.${save}.long`);
    const rollParts = ['1d20'];

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: this.data,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} ${game.i18n.localize('OSE.SavingThrow')}`,
      title: `${label} ${game.i18n.localize('OSE.SavingThrow')}`,
    });
  }
}
