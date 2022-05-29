import {hasNoValueOrEquals} from "./hasNoValueOrEquals";

const UNDEFINED_ARRAY = [undefined, null, Number.NaN]
const DEFINED_ARGUMENTS = [1, -1, 0, false, true, new Date()]

describe.each(UNDEFINED_ARRAY)("When one of the arguments is %s", (left) => {
  const check = jest.fn();
  it.each([ -1, "abc", new Date() ])(`${left} !== %s`, (right) => {
    expect(hasNoValueOrEquals(left, right)).toBeFalsy();
    expect(hasNoValueOrEquals(left, right, check)).toBeFalsy();

    expect(hasNoValueOrEquals(right, left)).toBeFalsy();
    expect(hasNoValueOrEquals(right, left, check)).toBeFalsy();

    expect(check).toBeCalledTimes(0);
  });

  it.each(UNDEFINED_ARRAY)(`${left} === %s`, (right) => {
    expect(hasNoValueOrEquals(left, right)).toBeTruthy();
    expect(hasNoValueOrEquals(left, right, check)).toBeTruthy();

    expect(hasNoValueOrEquals(right, left)).toBeTruthy();
    expect(hasNoValueOrEquals(right, left, check)).toBeTruthy();

    expect(check).toBeCalledTimes(0);
  });
});

describe.each(DEFINED_ARGUMENTS)("When one of the arguments is %s", (left) => {
  const check = jest.fn((left, right) => left === right);
  afterEach(() => {
    check.mockClear();
  });
  it.each(DEFINED_ARGUMENTS.filter((e) => e!= left))(`${left} !== %s`, (right) => {
    expect(hasNoValueOrEquals(left, right)).toBeFalsy();
    expect(hasNoValueOrEquals(left, right, check)).toBeFalsy();
    expect(check).toBeCalledTimes(1);

    check.mockClear();

    expect(hasNoValueOrEquals(right, left)).toBeFalsy();
    expect(hasNoValueOrEquals(right, left, check)).toBeFalsy();
    expect(check).toBeCalledTimes(1);
  });

  it(`${left} === ${left}`, () => {
    expect(hasNoValueOrEquals(left, left)).toBeTruthy();
    expect(hasNoValueOrEquals(left, left, check)).toBeTruthy();
    expect(check).toBeCalledTimes(1);
  });
});

describe.each(DEFINED_ARGUMENTS)("When Function reverts its logic %s", (left) => {
  const check = jest.fn((left, right) => left !== right);
  afterEach(() => {
    check.mockClear();
  });
  it.each(DEFINED_ARGUMENTS.filter((e) => e!= left))(`${left} === %s`, (right) => {
    expect(hasNoValueOrEquals(left, right)).toBeFalsy();
    expect(hasNoValueOrEquals(left, right, check)).toBeTruthy();
    expect(check).toBeCalledTimes(1);

    check.mockClear();

    expect(hasNoValueOrEquals(right, left)).toBeFalsy();
    expect(hasNoValueOrEquals(right, left, check)).toBeTruthy();
    expect(check).toBeCalledTimes(1);
  });

  it(`${left} === ${left}`, () => {
    expect(hasNoValueOrEquals(left, left)).toBeTruthy();
    expect(hasNoValueOrEquals(left, left, check)).toBeFalsy();
    expect(check).toBeCalledTimes(1);
  });
});
