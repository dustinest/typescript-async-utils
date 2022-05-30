import {useValueChange} from "./useValueChange";
import {ChangeEvent} from "react";
import {valueOfFloat} from "typescript-nullsafe";

export const useNumberValueChange = (value: string | number | null | undefined) =>
  useValueChange<number, string | number | null | undefined, string | number | null | undefined>({
      initValue: valueOfFloat(value, 0),
      valueParser: (newValue) => valueOfFloat(newValue, 0),
      objectEquals: (value1, value2) => value1 === value2,
      resetValueParser: (newValue, oldValue) => valueOfFloat(newValue, oldValue)
    }
  );

export const useNumberInputValueChange = (value: string | number | null | undefined) =>
  useValueChange<number, ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, string | number | null | undefined>({
      initValue: valueOfFloat(value, 0),
      objectEquals: (value1, value2) => value1 === value2,
      valueParser: (newValue) => valueOfFloat(newValue.target.value, 0),
      resetValueParser: (newValue, oldValue) => valueOfFloat(newValue, oldValue)
    }
  );
