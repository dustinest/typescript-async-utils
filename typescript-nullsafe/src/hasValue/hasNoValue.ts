import {hasValue} from "./hasValue";

/**
 * Tests if value is null or undefined
 * @param value to test
 * Returns true if value is null or undefined otherwise false
 */
export const hasNoValue = (value: any): value is null | undefined => !hasValue(value);
