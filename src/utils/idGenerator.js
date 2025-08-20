// src/utils/idGenerator.js

/**
 * Generates a unique ID using the current timestamp and a random string.
 * This is a non-UUID alternative.
 * Example output: "q_lf1z3p9o_b1x2c3d4"
 * @returns {string} A new unique ID.
 */
export function generateCustomUniqueId() {
  // Get the current time in milliseconds and convert it to a base-36 string (a-z, 0-9)
  const timestamp = Date.now().toString(36);
  
  // Get a random number, convert it to base-36, and slice off the "0." part
  const randomStr = Math.random().toString(36).substring(2, 10);

  // Return the combined, structured ID
  return `q_${timestamp}_${randomStr}`;
}