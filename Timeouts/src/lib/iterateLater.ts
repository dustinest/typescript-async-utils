import {iterateAsyncLater} from "./iterateAsyncLater";
import {CancellablePromise} from "../type/CancellablePromise";

export const iterateLater = <ValueType>(list: ValueType[], runnable: (value: ValueType, index: number, cancel: () => void) => any, timeout?: number): CancellablePromise<void> =>
  iterateAsyncLater(list, async (value, index, cancel) => runnable(value, index, cancel), timeout);
