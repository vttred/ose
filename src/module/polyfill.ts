/**
 * @file Polyfills for the system
 */

export default () => {
  // @ts-ignore - Math.clamp is not a standard JS function
  if (typeof Math.clamp !== "function") {
    // @ts-ignore - Math.clamp is not a standard JS function
    Math.clamp = Math.clamped;
  }
};
