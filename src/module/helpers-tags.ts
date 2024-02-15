/**
 * @file Contains helpers for tag generation
 */

const OseTags = {
  /**
  * Returns the formula used for dice roll calculations
  * @param actor - The actor object which owns the item with roll data
  * @param data.roll - The string used to generate a formula
  * @returns rollFormula - The constructed roll formula
  */
  rollTagFormula({
    actor = {},
    data = {
      roll: "",
    },
  } = {}) {

    const formulaData = {
      actor,
      data,
    };

    const tagFormula = new Roll(data.roll, formulaData).formula;
    return tagFormula;
  },

  rollTagTarget({
    rollType = "" as keyof typeof CONFIG.OSE.roll_type,
    rollTarget = null,
  } = {}) {

    const tagTarget =
      rollTarget === null
        ? ""
        : ` ${CONFIG.OSE.roll_type[rollType]}${rollTarget}`;

    return tagTarget;
  },
};

export default OseTags;
