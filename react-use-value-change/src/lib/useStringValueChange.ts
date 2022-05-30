import {useValueChange} from "./useValueChange";
import {ChangeEvent} from "react";
import {valueOf} from "typescript-nullsafe";

export const useStringValueChange = (value: string | null | undefined) =>
  useValueChange<string, string | null | undefined, string | null | undefined>({
      initValue: valueOf(value, ""),
      objectEquals: (value1, value2) => value1 === value2,
      valueParser: (newValue) => valueOf(newValue, ""),
      resetValueParser: (newValue, oldValue) => valueOf(newValue, oldValue)
    }
  );

export const useStringInputValueChange = (value: string | null | undefined) =>
  useValueChange<string, ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, string | null | undefined>({
      initValue: valueOf(value, ""),
      objectEquals: (value1, value2) => value1 === value2,
      valueParser: (newValue) => valueOf(newValue.target.value, ""),
      resetValueParser: (newValue, oldValue) => valueOf(newValue, oldValue)
    }
  );
