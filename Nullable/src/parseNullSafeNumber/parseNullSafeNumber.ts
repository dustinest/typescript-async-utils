import {hasNoValue, hasValue} from "../hasValue";
import {FunctionOrVariable, resolveFunctionOrVariable} from "../common/functionOrVariable";

type NullOrUnknownValueOrString = number | undefined | null | string;

/**
 * Finds number in any given string
 * @param value to check
 * @param defaultValue to return
 * @param hasComma if comma should be checked
 */
const parseAnyNumber = (value: NullOrUnknownValueOrString, defaultValue: FunctionOrVariable<number>, hasComma: boolean): number => {
  if (hasNoValue(value)) {
    return resolveFunctionOrVariable(defaultValue);
  }
  if (typeof value === "number") return value;
  const valueStr = value.trim();
  if (valueStr.length === 0) {
    return resolveFunctionOrVariable(defaultValue);
  }
  const valueStrNumber = hasComma ? parseFloat(valueStr) : parseInt(valueStr, 10);
  if (hasValue(valueStrNumber)) {
    return valueStrNumber;
  }
  // let's try to extract numbers from the string
  let isCommaDefined = !hasComma;
  const numberValues:string = valueStr.split('').map((character) => {
    if ((character === "." || character === ",") && !isCommaDefined) {
      isCommaDefined = true;
      return ".";
    }
    const result = parseInt(character, 10);
    if (hasValue(result)) return character;
    return null;
  }).filter(hasValue).join("");
  const numberValuesNumber = hasComma ? parseFloat(numberValues) : parseInt(numberValues, 10);
  if (hasValue(numberValuesNumber)) {
    return numberValuesNumber;
  }
  return resolveFunctionOrVariable(defaultValue);
}

/**
 * Returns value if set otherwise defaultValue
 * @param value to return if is not null or not undefined
 * @param defaultValue to return if value is not provided
 */
export const valueOfFloat = (value: NullOrUnknownValueOrString, defaultValue: FunctionOrVariable<number>): number => parseAnyNumber(value, defaultValue, true);
/**
 * Returns value if set otherwise defaultValue
 * @param value to return if is not null or not undefined
 * @param defaultValue to return if value is not provided
 */
export const valueOfInteger = (value: NullOrUnknownValueOrString, defaultValue: FunctionOrVariable<number>): number => parseAnyNumber(value, defaultValue, false);
