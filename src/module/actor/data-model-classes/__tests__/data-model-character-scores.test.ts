import { QuenchMethods } from "../../../../e2e";
import OseDataModelCharacterScores from "../data-model-character-scores";

export const key = "ose.datamodel.character.scores";
export const options = { displayName: "Character Data Model: Ability Scores" };

export default ({ describe, it, expect }: QuenchMethods) => {
  // An array from 0-
  const scoreSpread = Array.from({ length: 21 }, (_el, idx) => idx);
  const scoreKeys = ["str", "int", "wis", "dex", "con", "cha"];
  const tables = [
    OseDataModelCharacterScores.standardAttributeMods,
    OseDataModelCharacterScores.cappedAttributeMods,
    OseDataModelCharacterScores.openDoorMods,
    OseDataModelCharacterScores.literacyMods,
    OseDataModelCharacterScores.spokenMods,
  ];
  const fromTable = (tableKey: number, score: number) =>
    OseDataModelCharacterScores.valueFromTable(tables[tableKey], score);
  const numberToScores = (number: number) =>
    Object.fromEntries(
      scoreKeys.map((key) => [key, { value: number, bonus: 0 }])
    );

  const buildTestCases = (
    score: number,
    key: string,
    mod: string,
    table: any
  ) => {
    const scoresToUse = numberToScores(score);
    const scoresObj = new OseDataModelCharacterScores(scoresToUse);
    return it(`${score}`, () => {
      expect(scoresObj[key][mod]).to.equal(fromTable(table, score));
    });
  };
  const buildTestCasesWithModifiers = (
    score: number,
    key: string,
    mod: string,
    table: any,
    added: number
  ) => {
    const scoresToUse = numberToScores(score);
    const scoresObj = new OseDataModelCharacterScores(scoresToUse);
    return it(`${score}`, () => {
      expect(scoresObj[key][mod]).to.equal(fromTable(table, score) + added);
    });
  };

  const spreadToModTests = (name: string) =>
    scoreKeys.map((key) =>
      describe(`${name}: ${key}`, () =>
        scoreSpread.map((score) => buildTestCases(score, key, "mod", 0)))
    );

  describe("Standard attribute modifiers", () => spreadToModTests("Attribute"));

  describe("Strength modifiers", () => {
    describe("Open Doors", () =>
      scoreSpread.map((score) => buildTestCases(score, "str", "od", 2)));
  });

  describe("Intelligence modifiers", () => {
    describe("Literacy", () =>
      scoreSpread.map((score) => buildTestCases(score, "int", "literacy", 3)));
    describe("Spoken Languages", () =>
      scoreSpread.map((score) => buildTestCases(score, "int", "spoken", 4)));
  });

  describe("Dexterity modifiers", () => {
    describe("Initiative", () =>
      scoreSpread.map((score) => buildTestCases(score, "dex", "init", 1)));
  });

  describe("Charisma modifiers", () => {
    describe("NPC Reaction", () =>
      scoreSpread.map((score) => buildTestCases(score, "cha", "npc", 1)));
    describe("Loyalty", () =>
      scoreSpread.map((score) =>
        buildTestCasesWithModifiers(score, "cha", "retain", 0, 4)
      ));
    describe("Number of Retainers", () =>
      scoreSpread.map((score) =>
        buildTestCasesWithModifiers(score, "cha", "loyalty", 0, 7)
      ));
  });
};
