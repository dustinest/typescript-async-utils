import {valueOf, valueOfAsync, valuesOf} from "../index";

const NO_VALUES = [null, undefined, Number.NaN];

describe("Test valueOf", () => {
  const check = jest.fn();
  afterEach(() => {
    check.mockClear();
  });

  it.each(NO_VALUES)(
    "Should not return %s but default value",
    (v: boolean | null | undefined | number) => {
      expect(valueOf(v, false)).toBeFalsy();
      expect(valueOf(v, true)).toBeTruthy();
    }
  );
  it.each([[], "", false, true, 0, 1, -1, "a"])(
    "Should return %s not default value",
    (v) => {
      expect(valueOf(v, false)).toStrictEqual(v);
      expect(valueOf(v, true)).toStrictEqual(v);
    }
  );

  it.each(NO_VALUES)(
    "Should not return %s but value from consumer",
    (v: boolean | null | undefined | number) => {
      expect(valueOf(v, () => false)).toBeFalsy();
      expect(valueOf(v, () => true)).toBeTruthy();
    }
  );
  it.each([[], "", false, true, 0, 1, -1, "a"])(
    "Should return %s not consumer",
    (v) => {
      expect(valueOf(v, check)).toStrictEqual(v);
      expect(valueOf(v, check)).toStrictEqual(v);
      expect(check).toBeCalledTimes(0);
    }
  );
  // noinspection SpellCheckingInspection
  it.each([parseInt("abaasdas"), parseFloat("ASDADASDA")])(
    "Should not return %s but consumer",
    (v) => {
      expect(valueOf(v, () => 234)).toStrictEqual(234);
      expect(valueOf(v, 234)).toStrictEqual(234);
    }
  );
  it.each([parseFloat("1.23")])(
    "Should return %s not consumer",
    (v) => {
      expect(valueOf(v, check)).toStrictEqual(1.23);
      expect(valueOf(v, 234)).toStrictEqual(1.23);
      expect(check).toBeCalledTimes(0);
    }
  );
  it.each([parseInt("1")])(
    "Should return %s not consumer",
    (v) => {
      expect(valueOf(v, check)).toStrictEqual(1);
      expect(valueOf(v, 234)).toStrictEqual(1);
      expect(check).toBeCalledTimes(0);
    }
  );
});

describe("Test valuesOf", () => {
  const PROBLEM_ARRAY = [[], false, true, 1, "", -1, 0 ];
  it("Should return clean array", () => {
    expect(valuesOf([...NO_VALUES, ...PROBLEM_ARRAY])).toStrictEqual(PROBLEM_ARRAY);
  });
});

describe("test valueOfAsync", () => {
  const check = jest.fn();
  afterEach(() => {
    check.mockClear();
  });
  it.each(NO_VALUES)(
    "Should not return %s but value from consumer",
    async (v: boolean | null | undefined | number) => {
      expect(valueOfAsync(v, async () => false)).resolves.toBeFalsy();
      expect(valueOfAsync(v, async () => true)).resolves.toBeTruthy();
    }
  );
  it.each([[], "", false, true, 0, 1, -1, "a"])(
    "Should return %s not consumer",
    async(v) => {
      expect(valueOfAsync(v, check)).resolves.toStrictEqual(v);
      expect(check).toBeCalledTimes(0);
    }
  );
  // noinspection SpellCheckingInspection
  it.each([parseInt("abaasdas"), parseFloat("ASDADASDA")])(
    "Should not return %s but consumer",
    async(v) => {
      expect(valueOfAsync(v, async () => 234)).resolves.toStrictEqual(234);
    }
  );
  it.each([parseFloat("1.23")])(
    "Should return %s not consumer",
    async(v) => {
      expect(valueOfAsync(v, check)).resolves.toStrictEqual(1.23);
      expect(check).toBeCalledTimes(0);
    }
  );
  it.each([parseInt("1")])(
    "Should return %s not consumer",
    async (v) => {
      expect(valueOfAsync(v, check)).resolves.toStrictEqual(1);
      expect(check).toBeCalledTimes(0);
    }
  );
});
