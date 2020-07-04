export const registerSettings = function () {
    game.settings.register('ose', 'individualInit', {
      name: game.i18n.localize('OSE.Setting.IndividualInit'),
      hint: game.i18n.localize('OSE.Setting.IndividualInitHint'),
      default: false,
      scope: 'world',
      type: Boolean,
      config: true
    });

    game.settings.register('ose', 'ascendingAC', {
      name: game.i18n.localize('OSE.Setting.AscendingAC'),
      hint: game.i18n.localize('OSE.Setting.AscendingACHint'),
      default: false,
      scope: 'world',
      type: Boolean,
      config: true
    });

    game.settings.register('ose', 'morale', {
      name: game.i18n.localize('OSE.Setting.Morale'),
      hint: game.i18n.localize('OSE.Setting.MoraleHint'),
      default: false,
      scope: 'world',
      type: Boolean,
      config: true
    });

    game.settings.register('ose', 'variableWeaponDamage', {
      name: game.i18n.localize('OSE.Setting.VariableWeaponDamage'),
      hint: game.i18n.localize('OSE.Setting.VariableWeaponDamageHint'),
      default: false,
      scope: 'world',
      type: Boolean,
      config: true
    });
}
  