import {DependencyList, useEffect} from "react";
import {useTimeoutAsync} from "./useTimeoutAsync";
import {UseTimeoutAsyncProps} from "../type/UseAsyncProps";

export function useTimeoutAsyncEffect<
  ValueType extends any = any,
  ErrorType extends any = Error
  >(
  asyncCallback: () => Promise<ValueType>,
  dependencies?: DependencyList,
  props?: UseTimeoutAsyncProps
) {
  const [state, callback] = useTimeoutAsync<ValueType, ErrorType>(asyncCallback, props)
  // Runs the callback each time deps change
  useEffect(() => {
    callback();
    return () => {
      callback.cancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return state
}
