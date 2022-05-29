import { CancellablePromise } from "../type/CancellablePromise";
import { runAsyncLater } from "./runAsyncLater";

export const runLater = <ValueType extends any = any>(runnable: () => ValueType, timeout?: number): CancellablePromise<ValueType> =>
  runAsyncLater<ValueType>(async () => runnable(), timeout);

