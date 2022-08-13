export type OseConfig = {
  systemPath: () => string;
  scores: Record<Attribute, string>;
  scores_short: Record<Attribute, string>;
  exploration_skills: Record<ExplorationSkill, string>;
  exploration_skills_short: Record<ExplorationSkill, string>;
  roll_type: Record<RollType, string>;
  saves_short: Record<Save, string>;
  saves_long: Record<Save, string>;
  armor: Record<Armor, string>;
  colors: Record<Color, string>;
  languages: string[];
  tags: Record<InventoryItemTag, string>;
  tag_images: Record<InventoryItemTag, string>;
  monster_saves: Record<
    number,
    { d: number; w: number; p: number; b: number; s: number }
  >;
  monster_thac0: Record<number, number>;
};

export type Attribute = "str" | "int" | "dex" | "wis" | "con" | "cha";
export type ExplorationSkill = "ld" | "od" | "sd" | "fs";
export type RollType = "result" | "above" | "below";
export type Save = "death" | "wand" | "paralysis" | "breath" | "spell";
export type Armor = "unarmored" | "light" | "heavy" | "shield";
export type Color =
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "blue"
  | "orange"
  | "white";
export type InventoryItemTag =
  | "melee"
  | "missile"
  | "slow"
  | "twohanded"
  | "blunt"
  | "brace"
  | "splash"
  | "reload"
  | "charge";

export const OSE: OseConfig = {
  systemPath: () => {
    return `/systems/${game.system.id}/dist`;
  },
  scores: {
    str: "OSE.scores.str.long",
    int: "OSE.scores.int.long",
    dex: "OSE.scores.dex.long",
    wis: "OSE.scores.wis.long",
    con: "OSE.scores.con.long",
    cha: "OSE.scores.cha.long",
  },
  scores_short: {
    str: "OSE.scores.str.short",
    int: "OSE.scores.int.short",
    dex: "OSE.scores.dex.short",
    wis: "OSE.scores.wis.short",
    con: "OSE.scores.con.short",
    cha: "OSE.scores.cha.short",
  },
  exploration_skills: {
    ld: "OSE.exploration.ld.long",
    od: "OSE.exploration.od.long",
    sd: "OSE.exploration.sd.long",
    fs: "OSE.exploration.ft.long",
  },
  exploration_skills_short: {
    ld: "OSE.exploration.ld.abrev",
    od: "OSE.exploration.od.abrev",
    sd: "OSE.exploration.sd.abrev",
    fs: "OSE.exploration.ft.abrev",
  },
  roll_type: {
    result: "=",
    above: "≥",
    below: "≤",
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
  armor: {
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
    white: "OSE.colors.white",
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
    "Pixie",
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
    melee: "systems/ose/assets/melee.png",
    missile: "systems/ose/assets/missile.png",
    slow: "systems/ose/assets/slow.png",
    twohanded: "systems/ose/assets/twohanded.png",
    blunt: "systems/ose/assets/blunt.png",
    brace: "systems/ose/assets/brace.png",
    splash: "systems/ose/assets/splash.png",
    reload: "systems/ose/assets/reload.png",
    charge: "systems/ose/assets/charge.png",
  },
  monster_saves: {
    0: {
      d: 14,
      w: 15,
      p: 16,
      b: 17,
      s: 18,
    },
    1: {
      d: 12,
      w: 13,
      p: 14,
      b: 15,
      s: 16,
    },
    4: {
      d: 10,
      w: 11,
      p: 12,
      b: 13,
      s: 14,
    },
    7: {
      d: 8,
      w: 9,
      p: 10,
      b: 10,
      s: 12,
    },
    10: {
      d: 6,
      w: 7,
      p: 8,
      b: 8,
      s: 10,
    },
    13: {
      d: 4,
      w: 5,
      p: 6,
      b: 5,
      s: 8,
    },
    16: {
      d: 2,
      w: 3,
      p: 4,
      b: 3,
      s: 6,
    },
    19: {
      d: 2,
      w: 2,
      p: 2,
      b: 2,
      s: 4,
    },
    22: {
      d: 2,
      w: 2,
      p: 2,
      b: 2,
      s: 2,
    },
  },
  monster_thac0: {
    0: 20,
    1: 19,
    2: 18,
    3: 17,
    4: 16,
    5: 15,
    6: 14,
    7: 13,
    9: 12,
    10: 11,
    12: 10,
    14: 9,
    16: 8,
    18: 7,
    20: 6,
    22: 5,
  },
};
