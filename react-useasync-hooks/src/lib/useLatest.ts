import {MutableRefObject, useEffect, useRef} from "react";

export const useLatest = <T, N = T>(value: T, normalizer?: (value: T) => N): MutableRefObject<N> => {
  const _normalizer = normalizer ? normalizer : (normalized: T) => normalized as any as N;

  const result = useRef<N>(_normalizer(value))
  useEffect(() => {
    result.current = _normalizer(value);
  })
  return result
}
