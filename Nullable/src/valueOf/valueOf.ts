import {hasValue} from "../hasValue";
import {FunctionOrVariable, resolveFunctionOrVariable} from "../common/functionOrVariable";

/**
 * Returns value if set otherwise defaultValue
 * @param value to return if is not null or not undefined
 * @param defaultValue to return if value is not provided
 */
export const valueOf = <T>(
  value: T | undefined | null,
  defaultValue: FunctionOrVariable<T>
): T => {
  if (hasValue(value)) return value;
  return resolveFunctionOrVariable(defaultValue);
};


/**
 * Returns null safe array with not null items
 * @param value - array to provide
 * Returns empty array if value is null or undefined otherwise array provided with null safe values
 */
export const valuesOf = <T>(value: T[] | undefined | null): T[] => {
  return valueOf(value, []).filter(hasValue);
};

/**
 * Returns value if set otherwise defaultValue
 * @param value to return if is not null or not undefined
 * @param defaultValue to return if value is not provided
 */
export const valueOfAsync = async <T>(
  value: T | undefined | null,
  defaultValue: () => Promise<NonNullable<T>>
): Promise<T> => {
  if (hasValue(value)) return value;
  return defaultValue();
};
