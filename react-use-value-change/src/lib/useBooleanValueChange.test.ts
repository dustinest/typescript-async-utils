/** @jest-environment jsdom */

import {UseValueTrackingResult} from "../type/UseValueTrackingParams";
import {act, renderHook} from "@testing-library/react-hooks";
import {useBooleanValueChange} from "./useBooleanValueChange";

describe("useValueChange is changing", () => {
  it.each([
    ["the initial value", false],
    ["false", false],
    ["true", true],
    ["on", true]
  ])("when %s is set then %s is expected", async(given, expected) => {
    const {result} = renderHook<string, UseValueTrackingResult<boolean | null | undefined, boolean | string | null | undefined>>(() =>
      useBooleanValueChange(given)
    );

    expect(result.current[0]).toBe(expected);
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe(expected);
  });

  it("confirm the value is set", async() => {

    const {result} = renderHook<string, UseValueTrackingResult<boolean | null | undefined, boolean | string | null | undefined>>(() =>
      useBooleanValueChange(true)
    );

    expect(result.current[0]).toBe(true);
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe(true);

    // setValue() works
    act(() => result.current[1].setValue(false));
    expect(result.current[0]).toBe(false);
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe(true);


    // resetToCurrentValue() works
    act(() => result.current[1].resetToCurrentValue());
    expect(result.current[0]).toBe(false);
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe(false);

    // resetToOriginalValue() works
    act(() => result.current[1].setValue(true));
    expect(result.current[0]).toBe(true);
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe(false);

    act(() => result.current[1].resetToOriginalValue());
    expect(result.current[0]).toBe(false);
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe(false);

    // resetValue(Value 4) works
    act(() => result.current[1].resetValue(true));
    expect(result.current[0]).toBe(true);
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe(true);

    // resetValue() defaults to current value
    act(() => result.current[1].setValue(false));
    expect(result.current[0]).toBe(false);
    expect(result.current[2].equals).toBeFalsy();
    expect(result.current[2].original).toBe(true);

    act(() => result.current[1].resetValue());
    expect(result.current[0]).toBe(false);
    expect(result.current[2].equals).toBeTruthy();
    expect(result.current[2].original).toBe(false);
  });
});

