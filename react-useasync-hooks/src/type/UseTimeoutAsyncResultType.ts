import {UseTimeoutAsyncStatusResult} from "./UseTimeoutAsyncResult";

export type UseTimeoutAsyncResultType<
  ValueType extends any = any,
  ErrorType extends any = Error,
  Args extends any[] = any[]> = [
  UseTimeoutAsyncStatusResult<ValueType, ErrorType>,
    ((...args: Args) => Promise<void>) & { cancel: () => void }
];
