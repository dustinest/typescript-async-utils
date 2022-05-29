import {Optional} from "../index";

describe("Check empty optional", () => {
  it.each([
    Optional.empty<string | undefined | null>(),
    Optional.ofNullable<string | undefined | null>(null),
    Optional.ofNullable<string | undefined | null>(undefined)
  ])("Optional is empty", (optional) => {
    expect(optional.isPresent()).toBeFalsy();
    expect(optional.isEmpty()).toBeTruthy();
    const callable = jest.fn();
    optional.ifPresent(callable);
    expect(optional.map(callable).isPresent()).toBeFalsy();
    expect(optional.flatMap(callable).isPresent()).toBeFalsy();
    expect(optional.filter(callable).isPresent()).toBeFalsy();
    expect(optional.orElse("abc")).toBe("abc");
    expect(optional.orElse(null)).toBe(null);
    expect(optional.orElse(undefined)).toBe(undefined);
    expect(optional.orElseGet(() => "lorem ipsum est")).toBe("lorem ipsum est");
    expect(optional.orElseGet(() => null)).toBe(null);
    expect(optional.orElseGet(() => undefined)).toBe(undefined);
    const getter = () => {
      optional.get();
    }
    expect(getter).toThrow("The value is null or undefined or Number.NAN!");

    const orElseConsumer = jest.fn();
    optional.ifPresentOrElse(callable, orElseConsumer);
    expect(callable).toBeCalledTimes(0);
    expect(orElseConsumer).toBeCalledTimes(1);
  });
});

describe("Check optional values", () => {
  const testOptional = (optional: Optional<any>, value: any) => {
    expect(optional.isPresent()).toBeTruthy();
    const callable = jest.fn();
    optional.ifPresent(callable);
    optional.map(callable);
    optional.flatMap(callable);
    optional.filter(callable);
    expect(optional.orElse("abc")).toStrictEqual(value);
    expect(optional.orElse(null)).toStrictEqual(value);
    expect(optional.orElse(undefined)).toStrictEqual(value);
    expect(optional.orElseGet(callable)).toStrictEqual(value);
    expect(optional.orElseGet(() => null)).toStrictEqual(value);
    expect(optional.orElseGet(() => undefined)).toStrictEqual(value);
    expect(optional.get()).toStrictEqual(value);
    expect(optional.map((_value: any) => null).isPresent()).toBeFalsy();
    expect(optional.map((_value: any) => undefined).isPresent()).toBeFalsy();
    expect(optional.map((_value: any) => "lorem ipsum est").get()).toBe(
      "lorem ipsum est"
    );

    const orElseConsumer = jest.fn();
    optional.ifPresentOrElse(callable, orElseConsumer);
    expect(callable).toBeCalledTimes(5);
    expect(orElseConsumer).toBeCalledTimes(0);
  };

  it.each([
    true,
    false,
    "",
    "lorem ipsum est",
    [],
    ["a, b, c"],
    { one: "a", two: "true", three: false }
  ])("Optional.of(%s)", (v) => {
    testOptional(Optional.of<any>(v), v);
  });

  it.each([
    true,
    false,
    "",
    "lorem ipsum est",
    [],
    ["a, b, c"],
    { one: "a", two: "true", three: false }
  ])("Optional.ofNullable(%s)", (v) => {
    testOptional(Optional.ofNullable<any>(v), v);
  });
});
