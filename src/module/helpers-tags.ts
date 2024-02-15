/**
 * @file Contains helpers for tag generation
 */

const OseTags = {
  /**
  * Returns the formula used for dice roll calculations
  * @param actor - The actor object which owns the item with roll data
  * @param data.roll - The string used to generate a formula
  * @returns tagFormula - The constructed roll formula
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

  /**
  * Returns the roll type and target value of rolls
  * @param rollType - Type of roll target used
  * @returns tagTarget - The constructed type and target value
  */
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
