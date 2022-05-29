import {AsyncStatus} from "./AsyncStatus";

type BaseUseAsyncResult<S extends AsyncStatus> = { status: S; }
type MaybeUseAsyncResult<ValueType, S extends AsyncStatus> = {
  value?: ValueType;
} & BaseUseAsyncResult<S>;

export type AsyncResultInit<ValueType extends any = any> = MaybeUseAsyncResult<ValueType, AsyncStatus.INIT>;

export type AsyncResultWorking<ValueType extends any = any> = {
  cancel: () => void;
} & MaybeUseAsyncResult<ValueType, AsyncStatus.WORKING>;

export type AsyncResulSuccess<ValueType extends any = any> = {
  value: ValueType;
} &  BaseUseAsyncResult<AsyncStatus.SUCCESS>;

export type AsyncResulError<ValueType extends any = any, ErrorType extends any = Error> = {
  error: ErrorType;
} & MaybeUseAsyncResult<ValueType, AsyncStatus.ERROR>

export type AsyncResulCancelled<ValueType extends any = any> = MaybeUseAsyncResult<ValueType, AsyncStatus.CANCELLED>;

export type AsyncStatusResult<ValueType extends any = any, ErrorType extends any = Error> =
  AsyncResultInit<ValueType> |
  AsyncResultWorking<ValueType> |
  AsyncResulSuccess<ValueType> |
  AsyncResulError<ValueType, ErrorType> |
  AsyncResulCancelled<ValueType>;

