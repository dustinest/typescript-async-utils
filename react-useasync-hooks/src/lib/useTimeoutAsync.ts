import {Reducer, useMemo, useReducer, useState} from "react";
import {AsyncStatus} from "../type/AsyncStatus";
import {UseTimeoutAsyncProps} from "../type/UseAsyncProps";
import {
  AsyncResulCancelled,
  AsyncResulError,
  AsyncResulSuccess,
  AsyncResultInit,
  AsyncResultWorking,
  AsyncStatusResult
} from "../type/UseAsyncResult";
import {UseAsyncResultType} from "../type/UseAsyncResultType";
import {useLatest} from "./useLatest";
import {TimeoutAsyncStatus} from "../type/TimeoutAsyncStatus";
import {AsyncResultScheduled} from "../type/UseTimeoutAsyncResult";

interface AsyncReducedState<ValueType, ErrorType> {
  status: AsyncStatus | TimeoutAsyncStatus;
  value?: ValueType;
  error?: ErrorType;
  timeout?: {
    timeout : NodeJS.Timeout;
    reject: (error: ErrorType) => {};
  }
}

type AsyncActionSuccess<ValueType> = {
  status: AsyncStatus.SUCCESS;
  value: ValueType;
}
type AsyncActionError<ErrorType> = {
  status: AsyncStatus.ERROR;
  error?: ErrorType
}
type AsyncStatusPending = {
  status: AsyncStatus.INIT | AsyncStatus.WORKING | AsyncStatus.CANCELLED | TimeoutAsyncStatus.SCHEDULED;
}

type AsyncAction<ValueType, ErrorType> =
  AsyncActionSuccess<ValueType> |
  AsyncActionError<ErrorType> |
  AsyncStatusPending

export const useTimeoutAsync = <
  ValueType extends any = any,
  ErrorType extends any = Error,
  Args extends any[] = any[]
  >
(asyncCallback: (...args: Args) => Promise<ValueType>, properties?: UseTimeoutAsyncProps) : UseAsyncResultType<ValueType, ErrorType, Args> =>
{
  const props = useLatest<UseTimeoutAsyncProps | undefined, {useInit: boolean; milliseconds: number; }>(properties, (newProps) => {
    const {milliseconds = 100, useInit = false} = newProps ?? {};
    if (milliseconds <= 0) {
      console.warn(`Setting illegal milliseconds ${milliseconds}! Should be >= 0! Failing back to 100`)
      return {milliseconds: 100, useInit}
    }
    return {milliseconds, useInit}
  });

  const [state, dispatch] = useReducer<Reducer<AsyncReducedState<ValueType, ErrorType>, AsyncAction<ValueType, ErrorType>>, undefined>
  (
    (previous: AsyncReducedState<ValueType, ErrorType>, action: AsyncAction<ValueType, ErrorType>) => {
      switch (action.status) {
        case AsyncStatus.SUCCESS:
          return { status: AsyncStatus.SUCCESS, value: action.value };
        case AsyncStatus.ERROR:
          return { status: AsyncStatus.ERROR, error: action.error };
        case AsyncStatus.INIT:
          if (props.current.useInit) { return {...previous, ...{status: AsyncStatus.INIT}}; }
          if (previous.status !== TimeoutAsyncStatus.SCHEDULED ) {
            return {...previous, ...{status: TimeoutAsyncStatus.SCHEDULED}};
          } else {
            return previous;
          }
        default:
          return {...previous, ...{status: action.status}} as AsyncStatusPending;
      }
    },
    void 0,
    () => ({status: props.current.useInit ? AsyncStatus.INIT : TimeoutAsyncStatus.SCHEDULED} as AsyncStatusPending)
  );


  // Creates a stable callback that manages our working/success/error status updates
  // as the callback is invoked.
  const storedCallback = useLatest(asyncCallback);

  const [callback] = useState<((...args: Args) => Promise<void>) & { cancel: () => void }>(() => {
    const cancelled: Set<Promise<ValueType> | null> = new Set();
    const cancelledTimeouts: Set<NodeJS.Timeout | null> = new Set();
    let previous: Promise<ValueType> | null;
    let previousTimeout: NodeJS.Timeout | null;

    return Object.assign(
      async (...args: Args) => {
        // Reloading automatically cancels previous promises
        cancelled.add(previous);
        let current: Promise<ValueType> | null = null;
        let currentTimeout: NodeJS.Timeout | null = null;

        try {
          previous = current =  new Promise<ValueType> ((result, reject) => {
            previousTimeout = currentTimeout = setTimeout(() => {
              if (currentTimeout && !cancelledTimeouts.has(currentTimeout)) {
                dispatch({status: AsyncStatus.WORKING} as AsyncStatusPending);
                storedCallback.current(...args).then(result).catch(reject)
              } else {
                reject(new Error("Callback cancelled"));
              }
            }, props.current.milliseconds);
            dispatch({status: TimeoutAsyncStatus.SCHEDULED} as AsyncStatusPending);
          });
          const value = await current;
          if (currentTimeout && cancelledTimeouts.has(currentTimeout)) {
            clearTimeout(currentTimeout);
            dispatch({status: AsyncStatus.ERROR, error: new Error("Callback cancelled")} as AsyncActionError<ErrorType>);
          } else if (!cancelled.has(current)) {
            dispatch({status: AsyncStatus.SUCCESS, value});
          }
        } catch (error) {
          if (currentTimeout && cancelledTimeouts.has(currentTimeout)) {
            try {
              clearTimeout(currentTimeout);
            } catch (e) {
              // ignore the error
            }
          }
          if (current && !cancelled.has(current)) {
            dispatch({status: AsyncStatus.ERROR, error} as AsyncActionError<ErrorType>);
          }
        } finally {
          cancelledTimeouts.delete(currentTimeout);
          cancelled.delete(current);
        }
      },
      {
        cancel: () => {
          cancelledTimeouts.add(previousTimeout);
          cancelled.add(previous);
        },
      }
    ) as ((...args: Args) => Promise<void>) & { cancel: () => void };
  });

  return [
    useMemo(() => {
      const value = (state as AsyncResulSuccess<ValueType>).value;
      const resultWithValue = value !== null && value !== undefined && !Number.isNaN(value) ? { value } : {};
      switch (state.status) {
        case AsyncStatus.INIT:
          return {...resultWithValue, ...{ status: AsyncStatus.INIT }}  as AsyncResultInit<ValueType>;
        case AsyncStatus.WORKING:
          return {...resultWithValue, ...{
              status: AsyncStatus.WORKING,
              cancel: () => {
                // Prevent the callback from dispatching
                callback.cancel()
                // Create a new callback and set status to cancelled
                dispatch({status: AsyncStatus.CANCELLED});
              }
            }}  as AsyncResultWorking<ValueType>;
        case TimeoutAsyncStatus.SCHEDULED:
          return {...resultWithValue, ...{
              status: TimeoutAsyncStatus.SCHEDULED,
              cancel: () => {
                // Prevent the callback from dispatching
                callback.cancel()
                // Create a new callback and set status to cancelled
                dispatch({status: AsyncStatus.CANCELLED});
              }
            }}  as AsyncResultScheduled<ValueType>;
        case AsyncStatus.SUCCESS:
          return { value: state.value, status: AsyncStatus.SUCCESS } as AsyncResulSuccess<ValueType>;
        case AsyncStatus.ERROR:
          return {...resultWithValue, ...{
              status: AsyncStatus.ERROR,
              error: state.error
            }} as AsyncResulError<ValueType, ErrorType>;
        case AsyncStatus.CANCELLED:
          return {...resultWithValue, ...{ status: AsyncStatus.CANCELLED }} as AsyncResulCancelled<ValueType>;
      }
    }, [callback, state]) as AsyncStatusResult<ValueType, ErrorType>,
    callback,
  ] as const as [AsyncStatusResult<ValueType, ErrorType>, ((...args: Args) => Promise<void>) & { cancel: () => void }];
}
