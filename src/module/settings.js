export const registerSettings = function () {
  game.settings.register(game.system.id, "initiative", {
    name: game.i18n.localize("OSE.Setting.Initiative"),
    hint: game.i18n.localize("OSE.Setting.InitiativeHint"),
    default: "group",
    scope: "world",
    type: String,
    config: true,
    choices: {
      individual: "OSE.Setting.InitiativeIndividual",
      group: "OSE.Setting.InitiativeGroup",
    },
  });

  game.settings.register(game.system.id, "rerollInitiative", {
    name: game.i18n.localize("OSE.Setting.RerollInitiative"),
    hint: game.i18n.localize("OSE.Setting.RerollInitiativeHint"),
    default: "reset",
    scope: "world",
    type: String,
    config: true,
    choices: {
      keep: "OSE.Setting.InitiativeKeep",
      reset: "OSE.Setting.InitiativeReset",
      reroll: "OSE.Setting.InitiativeReroll",
    },
  });

  game.settings.register(game.system.id, "ascendingAC", {
    name: game.i18n.localize("OSE.Setting.AscendingAC"),
    hint: game.i18n.localize("OSE.Setting.AscendingACHint"),
    default: false,
    scope: "world",
    type: Boolean,
    config: true,
  });

  game.settings.register(game.system.id, "morale", {
    name: game.i18n.localize("OSE.Setting.Morale"),
    hint: game.i18n.localize("OSE.Setting.MoraleHint"),
    default: false,
    scope: "world",
    type: Boolean,
    config: true,
  });

  game.settings.register(game.system.id, "encumbranceOption", {
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
      complete: "OSE.Setting.EncumbranceComplete",
    },
  });

  game.settings.register(game.system.id, "significantTreasure", {
    name: game.i18n.localize("OSE.Setting.SignificantTreasure"),
    hint: game.i18n.localize("OSE.Setting.SignificantTreasureHint"),
    default: 800,
    scope: "world",
    type: Number,
    config: true,
  });

  game.settings.register(game.system.id, "languages", {
    name: game.i18n.localize("OSE.Setting.Languages"),
    hint: game.i18n.localize("OSE.Setting.LanguagesHint"),
    default: "",
    scope: "world",
    type: String,
    config: true,
  });
  game.settings.register("ose", "applyDamageOption", {
    name: game.i18n.localize("OSE.Setting.applyDamageOption"),
    hint: game.i18n.localize("OSE.Setting.applyDamageOptionHint"),
    default: "selected",
    scope: "world",
    type: String,
    config: true,
    choices: {
      selected: "OSE.Setting.damageSelected",
      targeted: "OSE.Setting.damageTarget",
    },
  });
};
