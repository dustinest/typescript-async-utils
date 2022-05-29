import {CancellablePromise} from "../type/CancellablePromise";
import {JobRunningError} from "../type/Exceptions";

export const runAsyncLater = <ValueType extends any = any>(
  runnable: () => Promise<ValueType>,
  timeout?: number
): CancellablePromise<ValueType> => {
  let timeoutValue: NodeJS.Timeout | null = null;
  let rejects: (reason?: any) => void = () => {
    // do nothing
  };
  let running: boolean = true;

  const result = new Promise<ValueType>((resolve, reject) => {
    rejects = reject;
    try {
      if (!timeout || timeout === 0) {
        return runnable().then((runnableResult) => {
          if (running) resolve(runnableResult);
        }).catch((error) => {
          if (running) reject(error);
        });
      }
      timeoutValue = setTimeout(
        () => runnable().then((runnableResult) => {
          if (running) resolve(runnableResult);
        }).catch((error) => {
          if (running) reject(error);
        }), timeout);
    } catch (error) {
      reject(error);
    }
  });
  return Object.assign(result, {
      cancel: () => {
        try {
          if (timeoutValue !== null) {
            try {
              clearTimeout(timeoutValue);
            } catch (e) {
              // ignore the error
            }
            timeoutValue = null;
          }
          if (running) rejects(new JobRunningError());
        } finally {
          running = false;
        }
      }
    }
  );
};
