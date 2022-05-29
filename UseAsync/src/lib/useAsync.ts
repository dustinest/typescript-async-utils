import {Reducer, useEffect, useMemo, useReducer, useState} from "react";
import {AsyncStatus} from "../type/AsyncStatus";
import {UseAsyncProps} from "../type/UseAsyncProps";
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

interface AsyncReducedState<ValueType, ErrorType> {
  status: AsyncStatus;
  value?: ValueType;
  error?: ErrorType;
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
  status: AsyncStatus.INIT | AsyncStatus.WORKING | AsyncStatus.CANCELLED;
}

type AsyncAction<ValueType, ErrorType> =
  AsyncActionSuccess<ValueType> |
  AsyncActionError<ErrorType> |
  AsyncStatusPending;

export const useAsync = <
  ValueType extends any = any,
  ErrorType extends any = Error,
  Args extends any[] = any[]
  >
(asyncCallback: (...args: Args) => Promise<ValueType>, properties?: UseAsyncProps) : UseAsyncResultType<ValueType, ErrorType, Args> =>
{
  const props = useLatest<UseAsyncProps | undefined, {useInit: boolean}>(properties, (newProps) => {
    const {useInit = false} = newProps ?? {};
    return {useInit}
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
          if (previous.status !== AsyncStatus.WORKING ) {
            return {...previous, ...{status: AsyncStatus.WORKING}};
          } else {
            return previous;
          }
        default:
          return {...previous, ...{status: action.status}} as AsyncStatusPending;
      }
    },
    void 0,
    () => ({status: props.current.useInit ? AsyncStatus.INIT : AsyncStatus.WORKING} as AsyncStatusPending)
  );

  // Creates a stable callback that manages our working/success/error status updates
  // as the callback is invoked.
  const storedCallback = useLatest(asyncCallback);

  const [callback] = useState<((...args: Args) => Promise<void>) & { cancel: () => void }>(() => {
    const cancelled: Set<Promise<ValueType> | null> = new Set();
    let previous: Promise<ValueType> | null;

    return Object.assign(
      async (...args: Args) => {
        // Reloading automatically cancels previous promises
        cancelled.add(previous);
        dispatch({status: AsyncStatus.WORKING} as AsyncStatusPending);
        let current: Promise<ValueType> | null = null;

        try {
          previous = current = storedCallback.current(...args);
          const value = await current;
          if (!cancelled.has(current)) {
            dispatch({status: AsyncStatus.SUCCESS, value});
          }
        } catch (error) {
          if (current && !cancelled.has(current)) {
            dispatch({status: AsyncStatus.ERROR, error} as AsyncActionError<ErrorType>);
          }
        } finally {
          cancelled.delete(current);
        }
      },
      {
        cancel: () => {
          cancelled.add(previous);
        },
      }
    ) as ((...args: Args) => Promise<void>) & { cancel: () => void };
  });

  // Cancels any pending async callbacks when the hook unmounts
  useEffect(() => callback.cancel, [callback]);

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
