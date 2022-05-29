import {hasNoValue} from "./hasNoValue";

const NO_VALUES = [null, undefined, Number.NaN];

describe("hasNoValue", () => {
  it.each([
    [], "", false, true, 0, 1, -1, "a",
    1, -1, 0, 123, 1.23, 0.001, -0.001,
  ])("%s is a value", (v) => {
    expect(hasNoValue(v)).toBeFalsy();
  });
  it.each(NO_VALUES)("%s is not a value", (v) => {
    expect(hasNoValue(v)).toBeTruthy();
  });
  it.each(["abc", "a0"])("Number.parseFloat(%s) has no value", (v) => {
    expect(hasNoValue(Number.parseFloat(v))).toBeTruthy();
  });
  it.each(["1.1", "0.1", "0", "1a"])("Number.parseFloat(%s) has value", (v) => {
    expect(hasNoValue(Number.parseFloat(v))).toBeFalsy();
  });
});

