/**
 * @file Tests for the class represening a character's ability scores
 */
import { QuenchMethods } from "../../../../e2e";
import OseDataModelCharacterScores from "../data-model-character-scores";

export const key = "ose.datamodel.character.scores";
export const options = { displayName: "Data Model: Character Ability Scores" };

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
      scoreKeys.map((scoreKey) => [scoreKey, { value: number, bonus: 0 }])
    );

  const buildTestCases = (
    score: number,
    scoreKey: string,
    mod: string,
    table: any
  ) => {
    const scoresToUse = numberToScores(score);
    const scoresObj = new OseDataModelCharacterScores(scoresToUse);
    return it(`${score}`, () => {
      expect(scoresObj[scoreKey][mod]).to.equal(fromTable(table, score));
    });
  };
  const buildTestCasesWithModifiers = (
    score: number,
    scoreKey: string,
    mod: string,
    table: any,
    added: number
  ) => {
    const scoresToUse = numberToScores(score);
    const scoresObj = new OseDataModelCharacterScores(scoresToUse);
    return it(`${score}`, () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(scoresObj[scoreKey][mod]).to.equal(
        fromTable(table, score) + added
      );
    });
  };

  const spreadToModTests = (name: string) =>
    scoreKeys.map((scoreKey) =>
      describe(`${name}: ${scoreKey}`, () =>
        scoreSpread.map((score) => buildTestCases(score, scoreKey, "mod", 0)))
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
