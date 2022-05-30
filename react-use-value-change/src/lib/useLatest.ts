import {MutableRefObject, useEffect, useRef} from "react";

export const useLatest = <T>(value: T): MutableRefObject<T> => {
  const result = useRef<T>(value)
  useEffect(() => {
    result.current = value;
  })
  return result
}
