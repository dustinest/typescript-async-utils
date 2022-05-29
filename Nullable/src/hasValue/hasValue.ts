/**
 * Tests if value is not null and undefined
 * @param value to test
 * Returns true if value is set - not null and not undefined otherwise false
 */
export const hasValue = <T>(value: T | undefined | null): value is T => {
  if (value === undefined || value === null) return false;
  return !(typeof value === "number" && Number.isNaN(value));
}
