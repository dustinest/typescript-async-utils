# Install

```
$ npm install react-useasync-hooks --save
```
or
```
$ yarn add react-useasync-hooks
```
[Direct link to npmjs.com](https://www.npmjs.com/package/react-useasync-hook)

# The problem

In many times we have to run

```typescript
useEffect(() => {
  (async () => {
    // some async code
  })();
}, [some_depenencies])
```
And manage it. The code is ugly and there are so many issues managing it. instead we could now run

```typescript
const status = useAsyncEffect(() => {
  // some async code
}, [some_depenencies])
```
Or

```typescript
const method = useCallback(() => {
  (async() => {
    // some async code
  })();
});
```

Or even using timeouts in your code.

## The API to the help:

Let's set up some types to make the code easier:

```typescript
type MyType = {
  name: string;
  isValid: boolean;
};
````

### useAsync()

```typescript
const [status, callback] = useAsync<MyType>(async () => {
  /** call some asynchronous code which returs MyType **/
  }, [some_depenencies])
```

Or if we want to have init status

```typescript
const [status, callback] = useAsync<MyType>(async (prop1: string, prop2: boolean) => {
  /** call some asynchronous code which returs MyType **/
  }, {useInit: true} // optional parameter, by default it is set to false
, [some_depenencies])
```
First argument is funciton and second one, which is not required is configuration, if we would like to see init status. The reason for not seeing init status is in most cases we load stuff and do not care if it is in init state.

The status is either:
- init (`status.type === AsyncStatus.INIT`) // only in case useInit is set to true (by default, when props are not set it is set to false) fails back to `AsyncStatus.WORKING` when `useInit` is set to false 
- init (`status.type === AsyncStatus.WORKING`) // when the callback is working
- init (`status.type === AsyncStatus.SUCCESS`) // when callback has finished working
- init (`status.type === AsyncStatus.ERROR`) // when some error happened
- init (`status.type === AsyncStatus.CANCELLED`) // when user interrupted the code

Status also might have value (`status.value`) which type is `MyType` and has always value when status is a success. In other cases it keeps the cached value.
In case of Error it also has an error value (`status.error`) which can be second argument in type (`useAsync<MyType, ErrorType>`).

The `callback` is function to call but also has property to cancel `callback.cancel()` which tries to interrupt the call


### useAsyncEffect()

This is a mix of `useAsync` and `useEffect` it returns just a `status` object which is described above.

### useTimeoutAsync()

It is similar to `useAsyncEffect` method except with `milliseconds` argument in configuration which defines when to make the call

```typescript
const [status, callback] = useTimeoutAsync<MyType>(async (prop1: string, prop2: boolean) => {
  /** call some asynchronous code which returs MyType **/
  }, {useInit: true, milliseconds: 500} // the
, [some_depenencies])
```
or
```typescript
const [status, callback] = useTimeoutAsync<MyType>(async (prop1: string, prop2: boolean) => {
  /** call some asynchronous code which returs MyType **/
  }, {milliseconds: 500} // the
, [some_depenencies])
```
or defaults to 100
```typescript
const [status, callback] = useTimeoutAsync<MyType>(async (prop1: string, prop2: boolean) => {
  /** call some asynchronous code which returs MyType **/
  }
, [some_depenencies])
```

Everything else works as described at useAsync

### useTimeoutAsyncEffect()

Utilizes the `useTimeoutAsync` and is mix with `useEffect` method and is triggered on dependency changes.


## credits

The project is based on the work of [@react-hook/async](https://www.npmjs.com/package/@react-hook/async) but as it grew I decided to make a stand alone project with less dependencies and some additional configuration changes.

