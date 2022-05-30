# Install

```
$ npm install react-use-value-change --save
```
or
```
$ yarn add react-use-value-change
```

[Direct link to npmjs.com](https://www.npmjs.com/package/react-use-value-change)

# The problem

Quite often I find myself having complex useEffect to detect the state changes. This library helps to keep up state tracking.

It contains Three simplified methods:

- `useStringValueChange`
- `useNumberValueChange`
- `useBooleanValueChange`

## Simple setup

```typescript
const [currentValue, {setValue, resetValue, resetToCurrentValue, resetToOriginalValue}, {equals, original}] = useStringValueChange("the initial value");
```
- `currentValue` is the string current value
- `original` is immutable original value (until value is reset)
- `equals` indicates if `original === currentValue`
- `setValue("new value")` will change the `currentValue`, keeps `original` and `equals` is false if the new value is different form original
- `resetValue()` will reset `original` to `currentValue` and `equals` to true
- `resetValue("something else")` will reset `currentValue` and `original` to "something else"  and `equals` to true
- `resetToCurrentValue()` will reset  the `original` to `currentValue` and `equals` to true
- `resetToOriginalValue()` will reset the `currentValue` to `original` and `equals` to true

All the other methods follows the same pattern.

## Using react input

The difference are with input listeners

- `useStringInputValueChange` accepts `HTMLTextAreaElement | HTMLInputElement`
- `useNumberInputValueChange` accepts `HTMLInputElement (input type number)`
- `useBooleanInputValueChange` accepts `HTMLInputElement (checkbox or radio)`

Those accept `HTMLTextAreaElement | HTMLInputElement` as setters. Which means one has to call

`setValue(value: HTMLInputElement)` instead of `setValue(value: string)` (or boolean or number)

## a bit more...

There is also an umbrella method for more complex logic: `useValueChange`, which has to be approached carefully as it might trigger recursive rendering.

See [useValueChange.test.ts](https://github.com/dustinest/typescript-async-utils/tree/main/react-usevalue/src/lib/useValueChange.test.ts) how to use it.


## Might be a bug, but it is not

When is used the initial value is immutable. One has to use the React `useffect` to reset the value.
