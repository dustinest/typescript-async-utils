import {useAsync} from "./useAsync";
import {DependencyList, useEffect} from "react";
import {UseAsyncProps} from "../type/UseAsyncProps";

export function useAsyncEffect<ValueType extends any = any,
  ErrorType extends any = Error>(
  asyncCallback: () => Promise<ValueType>,
  dependencies?: DependencyList,
  props?: UseAsyncProps
) {
  const [state, callback] = useAsync<ValueType, ErrorType>(asyncCallback, props);
  // Runs the callback each time deps change
  useEffect(() => {
    callback();
    return () => {
      callback.cancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return state;
}
