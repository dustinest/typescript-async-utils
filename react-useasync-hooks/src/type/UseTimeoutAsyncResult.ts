import {TimeoutAsyncStatus} from "./TimeoutAsyncStatus";
import {AsyncStatusResult} from "./UseAsyncResult";

export type AsyncResultScheduled<ValueType extends any = any> = {
  status: TimeoutAsyncStatus.SCHEDULED;
  value?: ValueType;
  cancel: () => void;
};

export type UseTimeoutAsyncStatusResult<ValueType extends any = any, ErrorType extends any = Error> =
  AsyncStatusResult<ValueType, ErrorType> |
  AsyncResultScheduled<ValueType>;
