/** @jest-environment jsdom */

import {UseValueTrackingResult} from "../type/UseValueTrackingParams";
import {act, renderHook} from "@testing-library/react-hooks";
import { useNumberValueChange} from "./useNumberValueChange";

describe("useValueChange is changing", () => {
  it("confirm the value is set", async() => {

    const {result} = renderHook<string, UseValueTrackingResult<number, string | number, string | number>>(() =>
      useNumberValueChange(1)
    );

    expect(result.current[0]).toBe(1);
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe(1);

    // setValue() works
    act(() => result.current[1].setValue("3.5"));
    expect(result.current[0]).toBe(3.5);
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe(1);

    act(() => result.current[1].setValue("2.5"));
    expect(result.current[0]).toBe(2.5);
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe(1);


    // resetToCurrentValue() works
    act(() => result.current[1].resetToCurrentValue());
    expect(result.current[0]).toBe(2.5);
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe(2.5);

    // resetToOriginalValue() works
    act(() => result.current[1].setValue(4));
    expect(result.current[0]).toBe(4);
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe(2.5);

    act(() => result.current[1].resetToOriginalValue());
    expect(result.current[0]).toBe(2.5);
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe(2.5);

    // resetValue(Value 4) works
    act(() => result.current[1].setValue(5));
    expect(result.current[0]).toBe(5);
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe(2.5);

    act(() => result.current[1].resetValue(6));
    expect(result.current[0]).toBe(6);
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe(6);

    // resetValue() defaults to current value
    act(() => result.current[1].setValue("7"));
    expect(result.current[0]).toBe(7);
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe(6);

    act(() => result.current[1].resetValue());
    expect(result.current[0]).toBe(7);
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe(7);
  });
});

