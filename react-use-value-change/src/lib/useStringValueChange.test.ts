/** @jest-environment jsdom */

import {UseValueTrackingResult} from "../type/UseValueTrackingParams";
import {act, renderHook} from "@testing-library/react-hooks";
import {useStringValueChange} from "./useStringValueChange";

describe("useValueChange is changing", () => {
  it("confirm the value is set", async() => {

    const {result} = renderHook<string, UseValueTrackingResult<string, string, string>>(() =>
      useStringValueChange("the initial value")
    );

    expect(result.current[0]).toBe("the initial value");
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe("the initial value");

    // setValue() works
    act(() => result.current[1].setValue("Value 2"));
    expect(result.current[0]).toBe("Value 2");
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe("the initial value");


    // resetToCurrentValue() works
    act(() => result.current[1].resetToCurrentValue());
    expect(result.current[0]).toBe("Value 2");
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe("Value 2");

    // resetToOriginalValue() works
    act(() => result.current[1].setValue("Value 3"));
    expect(result.current[0]).toBe("Value 3");
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe("Value 2");

    act(() => result.current[1].resetToOriginalValue());
    expect(result.current[0]).toBe("Value 2");
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe("Value 2");

    // resetValue(Value 4) works
    act(() => result.current[1].setValue("Something random"));
    expect(result.current[0]).toBe("Something random");
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe("Value 2");

    act(() => result.current[1].resetValue("Value 4"));
    expect(result.current[0]).toBe("Value 4");
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe("Value 4");

    // resetValue() defaults to current value
    act(() => result.current[1].setValue("Something random"));
    expect(result.current[0]).toBe("Something random");
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe("Value 4");

    act(() => result.current[1].resetValue());
    expect(result.current[0]).toBe("Something random");
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe("Something random");
  });
});

