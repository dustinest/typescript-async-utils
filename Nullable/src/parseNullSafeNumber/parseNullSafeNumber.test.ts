import { valueOfFloat } from "../index";

const NO_VALUES = [null, undefined, Number.NaN];

describe("Test NullSafe.valueOfFloat", () => {
  it.each(NO_VALUES)(
    "Should not return %s but default value",
    (v: null | undefined | number) => {
      expect(valueOfFloat(v, 456)).toStrictEqual(456);
      expect(valueOfFloat(v, 4.56)).toStrictEqual(4.56);
      expect(valueOfFloat(v, () => 456)).toStrictEqual(456);
      expect(valueOfFloat(v, () => 4.56)).toStrictEqual(4.56);
    }
  );
  it("When number is provided", () => {
    expect(valueOfFloat(1.23, 456)).toStrictEqual(1.23);
    expect(valueOfFloat(123, 4.56)).toStrictEqual(123);
    expect(valueOfFloat(1.23, () => 456)).toStrictEqual(1.23);
    expect(valueOfFloat(123, () => 4.56)).toStrictEqual(123);
  })
  it("When number is provided with method as default value", () => {
    expect(valueOfFloat(1.23, 456)).toStrictEqual(1.23);
    expect(valueOfFloat(123, 4.56)).toStrictEqual(123);
    expect(valueOfFloat(1.23, () => 456)).toStrictEqual(1.23);
    expect(valueOfFloat(123, () => 4.56)).toStrictEqual(123);
  })
  it("When string is provided", () => {
    expect(valueOfFloat("1.23", 456)).toStrictEqual(1.23);
    expect(valueOfFloat("123", 4.56)).toStrictEqual(123);
    expect(valueOfFloat("1.23", () => 456)).toStrictEqual(1.23);
    expect(valueOfFloat("123", () => 4.56)).toStrictEqual(123);
  })
  it("When string with characters is provided", () => {
    expect(valueOfFloat("a1.b23", 456)).toStrictEqual(1.23);
    expect(valueOfFloat("a1b23", 4.56)).toStrictEqual(123);
    expect(valueOfFloat("a1.2b3", () => 456)).toStrictEqual(1.23);
    expect(valueOfFloat("a12b3", () => 4.56)).toStrictEqual(123);
  })
});
