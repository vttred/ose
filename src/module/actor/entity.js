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

    const data = {...this.data, ...{
      rollData : {
        type: 'Save',
        stat: save
      }
    }};

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} ${game.i18n.localize('OSE.SavingThrow')}`,
      title: `${label} ${game.i18n.localize('OSE.SavingThrow')}`,
    });
  }

  rollCheck(score, options = {}) {
    const label = game.i18n.localize(`OSE.scores.${score}.long`);
    const rollParts = ['1d20'];

    const data = {...this.data, ...{
      rollData : {
        type: 'Check',
        stat: score
      }
    }};

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} ${game.i18n.localize('OSE.AbilityCheck')}`,
      title: `${label} ${game.i18n.localize('OSE.AbilityCheck')}`,
    });
  }

  rollAttack(attack, options={}) {
    const label = game.i18n.localize(`OSE.${attack}`);
    const rollParts = ['1d20',];

    const mods = this.computeModifiers();
    if (attack == 'Missile') {
      rollParts.push(
        '+',
        mods.dex.toString(),
        '+',
        this.data.data.thac0.mod.missile.toString()
      );
    } else if (attack == 'Melee') {
      rollParts.push(
        '+',
        mods.str.toString(),
        '+',
        this.data.data.thac0.mod.melee.toString()
      );
    }
    if (game.settings.get('ose', 'ascendingAC')) {
      rollParts.push('+', this.data.data.thac0.bba.toString());
    }

    const data = {...this.data, ...{
      rollData : {
        type: 'Attack',
        stat: attack,
        mods: mods
      }
    }};

    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} ${game.i18n.localize('OSE.Attack')}`,
      title: `${label} ${game.i18n.localize('OSE.Attack')}`,
    });
  }

  computeModifiers() {
    let _valueToMod = (val) => {
      switch (val) {
        case 3:
          return -3;
        case 4:
        case 5:
          return -2;
        case 6:
        case 7:
        case 8:
          return -1;
        case 9:
        case 10:
        case 11:
        case 12:
          return 0;
        case 13:
        case 14:
        case 15:
          return 1;
        case 16:
        case 17:
          return 2;
        case 18:
          return 3;
        default:
          return 0;
      }
    };
    let mods = {
      str: _valueToMod(this.data.data.scores.str.value),
      int: _valueToMod(this.data.data.scores.int.value),
      dex: _valueToMod(this.data.data.scores.dex.value),
      init: _valueToMod(this.data.data.scores.dex.value),
      cha: _valueToMod(this.data.data.scores.cha.value),
      npc: _valueToMod(this.data.data.scores.cha.value),
      wis: _valueToMod(this.data.data.scores.wis.value),
      con: _valueToMod(this.data.data.scores.con.value),
    };
    if (mods.init > 1) {
      mods.init -= 1;
    } else if (mods.init < -1) {
      mods.init += 1;
    }
    if (mods.npc > 1) {
      mods.npc -= 1;
    } else if (mods.npc < -1) {
      mods.npc += 1;
    }
    return mods;
  }
}
