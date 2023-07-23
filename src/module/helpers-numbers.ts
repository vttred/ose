/**
 * @file Contains helpers for working with numbers.
 */

/**
 * Abbreviate a number greater than 999 with a
 * letter noting that it is thousands, millions,
 * or billions.
 * @param num - The number to convert
 * @returns the converted string (or the number if less than 1000)
 */
export const abbreviateNumber = (num: number): string  => {
  // Bail early
  if (num < 1000) return num.toString()
  
  const units = ['k', 'm', 'b'];
  const decimal = (i: number) => Math.pow(1000, i+1);
  
  for (let i=units.length-1; i>=0; i--) {
    const d = decimal(i);
    if (num <= -d || num >= d)
      return +(num / d).toFixed(1) + units[i];
  }
}