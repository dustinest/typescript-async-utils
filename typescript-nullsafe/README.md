# Install

```
$ npm install typescript-nullsafe --save
```
or
```
$ yarn add typescript-nullsafe
```

[Direct link to npmjs.com](https://www.npmjs.com/package/typescript-nullsafe)

# The problem

In JavaScript `undefined` and `null`values are hard to check. When using `!variable`check then

- `!undefined === true`
- `!null === true`
- `!false === true`
- `!"" === true`
- `!Number.NaN === true`

This basically means
```javascript
!undefined === !null === !false === !"" == !Number.NaN
```
which is OK in most cases but when working with data might make code quite messy and end up with the code like:
```typescript
const parseNumber = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "Unknown";
  }
  return `${value}`
}
```
How would you like to write the same code as:
```typescript
const parseNumber = (value?: number | null) => 
  hasValue(value) ? `${value}` : "Unknown";

````

# The solution

To reduce the amount of code there are few simple methods described below. Also all methods are typesafe so there should be no problem using method such as:

```typescript
const method1 = (value: string) => {
/** do something with the string **/
}

const method2 = (value: string | undefined | null) => {
    if (hasValue(value))
        method1(value);
    // or
    if (!hasNoValue(value))
        console.log("no value!");
    else
        method1(value);
}
```
There should be no TypeScript problems as hasValue enforces the value to be not null nor undefined.

## hasValue method
The library solves the typescript issue with having null, undefined, false or empty string introducing methods:

- `hasValue(undefined) === false`
- `hasValue(null) === false`
- `hasValue(false) === true`
- `hasValue("") === true`
- `hasValue(Number.NaN) === false`

## hasNoValue method
Or reverted
- `hasNoValue(undefined) === true`
- `hasNoValue(null) === true`
- `hasNoValue(false) === false`
- `hasNoValue("") === false`
- `hasNoValue(Number.NaN) === true`

## valueOf method
And to get default values

- `valueOf(undefined, "abc") === "abc"`
- `valueOf(null, "abc") === "abc"`
- `valueOf(false, true) === false`
- `valueOf("", "abc") === ""`
- `valueOf(Number.NaN, 1) === 1`

The second argument can also be a callable and is called when first is undefined, null or Number.Nan for more complex logic
- `valueOf(undefined, () => "abc") === "abc"`
- `valueOf(null, () => "abc") === "abc"`
- `valueOf(false, () => true) === false`
- `valueOf("", () => "abc") === ""`
- `valueOf(Number.NaN, () => 1) === 1`

When, let's say we would like to get the default value from some endpoint or asynchronous code then we could use
- `valueOfAsync(undefined, async () => "abc") === "abc"`
- `valueOfAsync(null, async () => "abc") === "abc"`
- `valueOfAsync(false, async () => true) === false`
- `valueOfAsync("", async () => "abc") === ""`
- `valueOfAsync(Number.NaN, async () => 1) === 1`

## valuesOf method
Or to get value from array

`valuesOf([null, 1, undefined, Number.NaN, 2]) === [1,2]`

which basically can be written as `[null, 1, undefined, Number.NaN, 2].filter(hasValue)`but solves the issue with null or undefined:

- `valuesOf(null) === []` 
- `valuesOf(undefined) === []`

And reduced the amount of code.

## valueOfFloat and valueOfInteger methods

Also there is a method `valueOfFloat` and `valueOfInteger` which finds numbers from the string as in some regions comma is written as a dot.

- `valueOfFloat("ab.0.1") === 0.1`

## hasNoValueOrEquals

This is helper method to check if both variables are null or undefined or the same. It is shortcut for
`((hasNoValue(left) && hasNoValue(right)) || left === right)`
With one small fix. Sometimes we need to dig deeper so another variable is optionally added to check the value. For example:

```typescript
hasNoValueOrEquals(
  new Date(),
  new Date(),
  (left, right) => left.getMonth() == right.getMonth()
) === true;
```
The third argument is called when both first two arguments are not null, undefined nor Number.NaN.

## Optional

And introduces implementation of `Optional` - not so popular but known from other languages for null safeness.
