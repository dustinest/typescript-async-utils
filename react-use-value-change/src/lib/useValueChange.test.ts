/** @jest-environment jsdom */

import {useValueChange} from "./useValueChange";
import {hasValue} from "typescript-nullsafe";
import {UseValueTrackingResult} from "../type/UseValueTrackingParams";
import {act, renderHook} from "@testing-library/react-hooks";

type MyValueType = {
  stringValue: string;
  booleanValue: boolean;
  numberValue: number;
};

type MySetterType = [string, boolean, number];

type ResetType = {
  value1: string;
  value2: number;
  value3: boolean;
};


describe("useValueChange is changing", () => {
  it("confirm the value is set", async() => {

    const {result} = renderHook<string, UseValueTrackingResult<MyValueType, MySetterType, ResetType>>(() =>
      useValueChange<MyValueType, MySetterType, ResetType>(
        {
          initValue: {
            numberValue: 0,
            booleanValue: false,
            stringValue: "the initial value"
          },
          valueParser: (newValue) => {
            return {
              stringValue: newValue[0],
              booleanValue: newValue[1],
              numberValue: newValue[2]
            };
          },
          objectEquals: (value1, value2) => {
            return value1.booleanValue === value2.booleanValue && value1.stringValue === value2.stringValue && value1.numberValue === value2.numberValue;
          },
          resetValueParser: (newValue, oldValue) => {
            if (hasValue(newValue)) {
              return {
                stringValue: newValue.value1,
                booleanValue: newValue.value3,
                numberValue: newValue.value2
              };
            }
            return oldValue;
          }
        }
      )
    );

    expect(result.current[0]).toStrictEqual({ numberValue: 0, booleanValue: false, stringValue: "the initial value" });
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toStrictEqual({ numberValue: 0, booleanValue: false, stringValue: "the initial value" });

    // setValue() works and values are equal
    act(() => result.current[1].setValue(["the initial value", false, 0]));
    expect(result.current[0]).toStrictEqual({ numberValue: 0, booleanValue: false, stringValue: "the initial value" });
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toStrictEqual({ numberValue: 0, booleanValue: false, stringValue: "the initial value" });

    // setValue() works
    act(() => result.current[1].setValue(["Value 1", true, 1]));
    expect(result.current[0]).toStrictEqual({ numberValue: 1, booleanValue: true, stringValue: "Value 1" });
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toStrictEqual({ numberValue: 0, booleanValue: false, stringValue: "the initial value" });

    // resetToCurrentValue() works
    act(() => result.current[1].resetToCurrentValue());
    expect(result.current[0]).toStrictEqual({ numberValue: 1, booleanValue: true, stringValue: "Value 1" });
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toStrictEqual({ numberValue: 1, booleanValue: true, stringValue: "Value 1" });

    // resetToOriginalValue() works
    act(() => result.current[1].setValue(["Value 3", true, 2]));
    expect(result.current[0]).toStrictEqual({ numberValue: 2, booleanValue: true, stringValue: "Value 3" });
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toStrictEqual({ numberValue: 1, booleanValue: true, stringValue: "Value 1" });

    act(() => result.current[1].resetToOriginalValue());
    expect(result.current[0]).toStrictEqual({ numberValue: 1, booleanValue: true, stringValue: "Value 1" });
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toStrictEqual({ numberValue: 1, booleanValue: true, stringValue: "Value 1" });

    // resetValue(Value 4) works
    act(() => result.current[1].setValue(["Something random", false, 4]));
    expect(result.current[0]).toStrictEqual({ numberValue: 4, booleanValue: false, stringValue: "Something random" });
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toStrictEqual({ numberValue: 1, booleanValue: true, stringValue: "Value 1" });

    act(() => result.current[1].resetValue({
      value1: "value 4",
      value2: 5,
      value3: true,
    }));
    expect(result.current[0]).toStrictEqual({ numberValue: 5, booleanValue: true, stringValue: "value 4" });
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toStrictEqual({ numberValue: 5, booleanValue: true, stringValue: "value 4" });

    // resetValue() defaults to current value
    act(() => result.current[1].setValue(["Something random", false, 6]));
    expect(result.current[0]).toStrictEqual({ numberValue: 6, booleanValue: false, stringValue: "Something random" });
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toStrictEqual({ numberValue: 5, booleanValue: true, stringValue: "value 4" });

    act(() => result.current[1].resetValue());
    expect(result.current[0]).toStrictEqual({ numberValue: 6, booleanValue: false, stringValue: "Something random" });
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toStrictEqual({ numberValue: 6, booleanValue: false, stringValue: "Something random" });

  });
});

