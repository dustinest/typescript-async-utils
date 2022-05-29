import {CancellablePromise} from "../type/CancellablePromise";
import {runLater} from "./runLater";
import {ArrayJobRunningError, JobRunningError} from "../type/Exceptions";

export const iterateAsyncLater = <ValueType extends any = any>(
  list: ValueType[],
  runnable: (value: ValueType, index: number, cancel: () => void) => Promise<void>,
  timeout?: number
): CancellablePromise<void> => {
  let currentRunnable: CancellablePromise | null = null;
  let cancelled = false;

  return Object.assign(
    new Promise<void>((resolve, reject) => {
      // let index = -1;
      const _list = [...list];
      (async () => {
        for (let index = 0; index < _list.length; index++) {
          if (cancelled) {
            throw new ArrayJobRunningError(index);
          }
          if (index >= _list.length) {
            resolve();
            return;
          }
          // eslint-disable-next-line
          currentRunnable = runLater<void>(() => runnable(_list[index], index, () => {
            cancelled = true;
            if (currentRunnable) {
              currentRunnable.cancel();
            }
          }), timeout);
          try {
            await currentRunnable;
          } catch (error) {
            if (error instanceof JobRunningError) {
              throw new ArrayJobRunningError(index);
            }
            throw error;
          }
        }
        resolve();
      })().catch((error) => {
        cancelled = true;
        reject(error);
      });
    }),
    {
      cancel: () => {
        cancelled = true;
        if (currentRunnable) {
          currentRunnable.cancel();
        }
      }
    }
  );
}
