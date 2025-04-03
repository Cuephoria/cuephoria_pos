
/** Truncate a number to specified decimal places */
export const truncate = (value: number, places: number = 2): number => 
  Math.trunc(value * Math.pow(10, places)) / Math.pow(10, places);

/** Round a number to specified decimal places */
export const round = (value: number, places: number = 2): number => 
  Number(value.toFixed(places));

/** Calculate percentage of a total */
export const percentage = (part: number, total: number, places: number = 2): number => 
  truncate((part / total) * 100, places);

/** Safely parse a numeric value, returning 0 if invalid */
export const parseNumeric = (value: unknown, defaultValue: number = 0): number => {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};
