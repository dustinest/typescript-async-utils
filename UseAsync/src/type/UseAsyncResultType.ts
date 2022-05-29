import {AsyncStatusResult} from "./UseAsyncResult";

export type UseAsyncResultType<
  ValueType extends any = any,
  ErrorType extends any = Error,
  Args extends any[] = any[]> = [
  AsyncStatusResult<ValueType, ErrorType>,
    ((...args: Args) => Promise<void>) & { cancel: () => void }
];
