# Install

```
$ npm install typescript-async-timeouts --save
```
or
```
$ yarn add typescript-async-timeouts
```
[Direct link to npmjs.com](https://www.npmjs.com/package/typescript-async-timeouts)

## The problem 1: managing timeouts

Too many times we have to manage the timeouts. Keeping the timeout result somewhere and managing to clean it up. Aswell providing asynchronous method and keeping the promises increases the boulerplate.
To solve this there are two methods:

1. runAsyncLater - consumes asynchronous method returning promise
2. runLater - consumes blocking method

- Both have two parameters: function and number to run timeout with
- Timeout defaults to zero, which means it creates new promise and runs when browser resources are free
- Both returns promise with the value the consumed method provies with method `cancel()` to cancel the timeout

So, instead of:

```typescript
try {
  let timeout = null;
  const result = await new Promise((resolve, reject) => {
    timeout = setTimeout(() => async () => {
      try {
        const result = await myAsyncCall();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, 1)
  });
// when we would like to cancel
  if (timeout != null) {
    clearTimeout(timeout)
  }
} catch (error) {
  concole.error(error);
}

```
We could run
```typescript
try {
  const result = runAsyncLater(myAsyncCall, 1)
  result.cancel(); // to cancel the result
  await result; // to get the result
} catch (error) {
  console.error(error);
}
```

Short, right?
Also, there is a ashortcut to synchronous call

```typescript
try {
  const result = runLater(() => { return "OK"; }, 1);
  result.cancel(); // to cancel the result
  await result; // to get the result
} catch (error) {
  console.error(error);
}
```

## The problem 2: managing timeouts and iterating asynchronously

I have really long array to iterate or heavy logic which needs to be run on ech row and I would not like to block the browser, So, there is a way to iterate asynchronous way. With two methods:

To solve the problem there are two methods:

1. iterateAsyncLater - consumes asynchronous method returning promise
2. iterateLater - consumes blocking method

- Both have three parameters:
  1. array to parse
  2. consumer method
    - iterateAsyncLater - `(value: ValueType, index: number, cancel: () => void) => Promise<any>`
    - iterateLater - `(value: ValueType, index: number, cancel: () => void) => any`
  3. timeout in milliseconds (defaults to 0, which means the iteration is executed when browser resoures are free)
- Both return promise with void but have method cancel in it.
- Both consumer method cancel can be called any time to interrupt the iteration (in that case the promise returned by the call will also fail)

Basic syntax:
```typescript
const runnable = iterateAsyncLater([...long_array], async (value, index, cancel) => {
  // do some magic stuff or call cancel();
});
runnable.cancel() // If I decied not to go this way
await runnable; // to wait until it runs
```
Or when the run is not async
```typescript
const runnable = iterateLater([...long_array], (value, index, cancel) => {
  // do some magic stuff or call cancel();
});
runnable.cancel() // If I decied not to go this way
await runnable; // to wait until it runs
```
