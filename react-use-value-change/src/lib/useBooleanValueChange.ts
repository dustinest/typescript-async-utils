import {useValueChange} from "./useValueChange";
import {ChangeEvent} from "react";
import {hasNoValue, hasValue} from "typescript-nullsafe";

const isTrue = (value: boolean | string | null | undefined): boolean => {
  if (hasNoValue(value)) return false;
  return value === "true" ||  value === "on" || value === true;
};

export const useBooleanValueChange = (value: boolean | string | null | undefined) =>
  useValueChange<boolean | null | undefined, boolean | string | null | undefined>({
      initValue: isTrue(value),
      valueParser: (newValue) => isTrue(newValue),
      objectEquals: (value1, value2) => value1 === value2,
      resetValueParser: (newValue, oldValue) => hasValue(newValue) ? isTrue(newValue) : isTrue(oldValue)
    }
  );

export const useBooleanInputValueChange = (value: boolean | string | null | undefined) =>
  useValueChange<boolean, ChangeEvent<HTMLInputElement>, boolean | null | undefined>({
      initValue: isTrue(value),
      valueParser: (newValue) => isTrue(newValue.target.checked),
      objectEquals: (value1, value2) => value1 === value2,
      resetValueParser: (newValue, oldValue) => hasValue(newValue) ? isTrue(newValue) : isTrue(oldValue)
    }
  );
