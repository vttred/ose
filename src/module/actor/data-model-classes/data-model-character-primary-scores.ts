/**
 * @file A class representing the primary scores of a character
 */

interface PrimaryScores {
  str: boolean;
  dex: boolean;
  con: boolean;
  int: boolean;
  wis: boolean;
  cha: boolean;
}

export default class SaWPrimaryScores implements PrimaryScores {
  str: boolean = false;

  dex: boolean = false;

  con: boolean = false;

  int: boolean = false;

  wis: boolean = false;

  cha: boolean = false;

  constructor({ str, int, wis, dex, con, cha }: PrimaryScores) {
    this.str = str;
    this.dex = dex;
    this.con = con;
    this.int = int;
    this.wis = wis;
    this.cha = cha;
  }
}
