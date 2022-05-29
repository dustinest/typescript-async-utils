/**
 * Tests if value1 and value2 are both null or undefined or have the same value
 */
import {hasNoValue} from "./hasNoValue";

export const hasNoValueOrEquals = <T>(
  left: T | undefined | null,
  right: T | undefined | null,
  tester?: (left: T, right: T) => boolean
  ): boolean => {
  const leftNoValue = hasNoValue(left);
  const rightNoValue = hasNoValue(right);
  if (leftNoValue || rightNoValue) {
    return leftNoValue && rightNoValue;
  }
  if (hasNoValue(tester)) {
    return left === right;
  }
  return tester(left, right);
}
