export const registerSettings = function () {

  game.settings.register("ose", "initiative", {
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
    onChange: _ => window.location.reload()
  });

  game.settings.register("ose", "rerollInitiative", {
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
    }
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
      complete: "OSE.Setting.EncumbranceComplete",
    },
    onChange: _ => window.location.reload()
  });

  game.settings.register("ose", "significantTreasure", {
    name: game.i18n.localize("OSE.Setting.SignificantTreasure"),
    hint: game.i18n.localize("OSE.Setting.SignificantTreasureHint"),
    default: 800,
    scope: "world",
    type: Number,
    config: true,
    onChange: _ => window.location.reload()
  });
};
