export const registerSettings = function () {
  game.settings.register("ose", "individualInit", {
    name: game.i18n.localize("OSE.Setting.IndividualInit"),
    hint: game.i18n.localize("OSE.Setting.IndividualInitHint"),
    default: false,
    scope: "world",
    type: Boolean,
    config: true,
    onChange: _ => window.location.reload()
  });

  game.settings.register("ose", "ascendingAC", {
    name: game.i18n.localize("OSE.Setting.AscendingAC"),
    hint: game.i18n.localize("OSE.Setting.AscendingACHint"),
    default: false,
    scope: "world",
    type: Boolean,
    config: true,
    onChange: _ => window.location.reload()
  });

  game.settings.register("ose", "morale", {
    name: game.i18n.localize("OSE.Setting.Morale"),
    hint: game.i18n.localize("OSE.Setting.MoraleHint"),
    default: false,
    scope: "world",
    type: Boolean,
    config: true,
  });

  game.settings.register("ose", "variableWeaponDamage", {
    name: game.i18n.localize("OSE.Setting.VariableWeaponDamage"),
    hint: game.i18n.localize("OSE.Setting.VariableWeaponDamageHint"),
    default: false,
    scope: "world",
    type: Boolean,
    config: true,
  });

  game.settings.register("ose", "encumbranceOption", {
    name: game.i18n.localize("OSE.Setting.Encumbrance"),
    hint: game.i18n.localize("OSE.Setting.EncumbranceHint"),
    default: "detailed",
    scope: "world",
    type: String,
    config: true,
    choices: {
      disabled: "OSE.Setting.EncumbranceDisabled",
      basic: "OSE.Setting.EncumbranceBasic",
      detailed: "OSE.Setting.EncumbranceDetailed",
    },
  });

  game.settings.register("ose", "significantTreasure", {
    name: game.i18n.localize("OSE.Setting.SignificantTreasure"),
    hint: game.i18n.localize("OSE.Setting.SignificantTreasureHint"),
    default: 800,
    scope: "world",
    type: Number,
    config: true,
  });
};
