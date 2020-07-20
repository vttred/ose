export const OSE = {
  scores: {
    str: "OSE.scores.str.long",
    int: "OSE.scores.int.long",
    dex: "OSE.scores.dex.long",
    wis: "OSE.scores.wis.long",
    con: "OSE.scores.con.long",
    cha: "OSE.scores.cha.long",
  },
  roll_type: {
    result: "=",
    above: "≥",
    below: "≤"
  },
  saves_short: {
    death: "OSE.saves.death.short",
    wand: "OSE.saves.wand.short",
    paralysis: "OSE.saves.paralysis.short",
    breath: "OSE.saves.breath.short",
    spell: "OSE.saves.spell.short",
  },
  saves_long: {
    death: "OSE.saves.death.long",
    wand: "OSE.saves.wand.long",
    paralysis: "OSE.saves.paralysis.long",
    breath: "OSE.saves.breath.long",
    spell: "OSE.saves.spell.long",
  },
  armor : {
    unarmored: "OSE.armor.unarmored",
    light: "OSE.armor.light",
    heavy: "OSE.armor.heavy",
    shield: "OSE.armor.shield",
  },
  colors: {
    green: "OSE.colors.green",
    red: "OSE.colors.red",
    yellow: "OSE.colors.yellow",
    purple: "OSE.colors.purple",
    blue: "OSE.colors.blue",
    orange: "OSE.colors.orange",
    white: "OSE.colors.white"
  },
  languages: [
    "Common",
    "Lawful",
    "Chaotic",
    "Neutral",
    "Bugbear",
    "Doppelgänger",
    "Dragon",
    "Dwarvish",
    "Elvish",
    "Gargoyle",
    "Gnoll",
    "Gnomish",
    "Goblin",
    "Halfling",
    "Harpy",
    "Hobgoblin",
    "Kobold",
    "Lizard Man",
    "Medusa",
    "Minotaur",
    "Ogre",
    "Orcish",
    "Pixie"
  ],
  tags: {
    melee: "OSE.items.Melee",
    missile: "OSE.items.Missile",
    slow: "OSE.items.Slow",
    twohanded: "OSE.items.TwoHanded",
    blunt: "OSE.items.Blunt",
    brace: "OSE.items.Brace",
    splash: "OSE.items.Splash",
    reload: "OSE.items.Reload",
    charge: "OSE.items.Charge",
  },
  tag_images: {
    melee: "/systems/ose/assets/melee.png",
    missile: "/systems/ose/assets/missile.png",
    slow: "/systems/ose/assets/slow.png",
    twohanded: "/systems/ose/assets/twohanded.png",
    blunt: "/systems/ose/assets/blunt.png",
    brace: "/systems/ose/assets/brace.png",
    splash: "/systems/ose/assets/splash.png",
    reload: "/systems/ose/assets/reload.png",
    charge: "/systems/ose/assets/charge.png",
  },
  monster_saves: {
    0: {
      label: "Normal Human",
      d: 14,
      w: 15,
      p: 16,
      b: 17,
      s: 18
    },
    1: {
      label: "1-3",
      d: 12,
      w: 13,
      p: 14,
      b: 15,
      s: 16
    },
    4: {
      label: "4-6",
      d: 10,
      w: 11,
      p: 12,
      b: 13,
      s: 14
    },
    7: {
      label: "7-9",
      d: 8,
      w: 9,
      p: 10,
      b: 10,
      s: 12
    },
    10: {
      label: "10-12",
      d: 6,
      w: 7,
      p: 8,
      b: 8,
      s: 10
    },
    13: {
      label: "13-15",
      d: 4,
      w: 5,
      p: 6,
      b: 5,
      s: 8
    },
    16: {
      label: "16-18",
      d: 2,
      w: 3,
      p: 4,
      b: 3,
      s: 6
    },
    19: {
      label: "19-21",
      d: 2,
      w: 2,
      p: 2,
      b: 2,
      s: 4
    },
    22: {
      label: "22+",
      d: 2,
      w: 2,
      p: 2,
      b: 2,
      s: 2
    },
  }
};