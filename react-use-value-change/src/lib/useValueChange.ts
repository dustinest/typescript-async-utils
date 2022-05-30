import {Reducer, useMemo, useReducer} from "react";
import {UseValueTrackingParams, UseValueTrackingResult} from "../type/UseValueTrackingParams";
import {hasNoValueOrEquals, hasValue} from "typescript-nullsafe";
import {useLatest} from "./useLatest";

interface ReducedState<ValueType> {
  value: ValueType;
  originalValue: ValueType;
  equals: boolean;
}

enum Actions {
  SET,
  RESET,
  RESET_CURRENT,
  RESET_ORIGINAL
}

interface Action<ActionType = Actions> {
  action: ActionType
}

interface SetAction<ValueType, ActionType = Actions> extends Action<ActionType> {
  value: ValueType
}

type ActonType<SetterType, ResetType> =
  SetAction<SetterType, Actions.SET> |
  SetAction<ResetType | undefined, Actions.RESET> |
  Action<Actions.RESET_CURRENT | Actions.RESET_ORIGINAL>

const valuesEquals = <ValueType>(value1: ValueType, value2: ValueType, callback?: (v1: ValueType, v2: ValueType) => boolean) => {
  if (hasNoValueOrEquals(value1, value2)) return true;
  return hasValue(callback) && callback(value1, value2);
}

export const useValueChange = <
  ValueType extends any = any,
  SetterType = ValueType,
  ResetType = SetterType
  >({initValue, valueParser, objectEquals, resetValueParser} : UseValueTrackingParams<ValueType, SetterType, ResetType>):
  UseValueTrackingResult<ValueType, SetterType, ResetType> =>
{
  const currentValue = useLatest(initValue);
  const valueParserTracking = useLatest(valueParser);
  const resetValueParserTracking = useLatest(resetValueParser);
  const objectEqualsTracking = useLatest(objectEquals);
  const [state, dispatch] = useReducer<Reducer<ReducedState<ValueType>, ActonType<SetterType, ResetType>>, undefined>
  (
    (previous: ReducedState<ValueType>, action: ActonType<SetterType, ResetType>) => {
      switch (action.action) {
        case Actions.SET:
          const value = valueParserTracking.current(action.value, previous.value, previous.originalValue);
          if (valuesEquals(previous.value, value, objectEqualsTracking.current) && previous.equals) {
            return previous;
          }
          return {...previous, ...{
              value,
              equals: valuesEquals(value, previous.originalValue, objectEqualsTracking.current)
            }}
        case Actions.RESET_CURRENT:
          if (valuesEquals(previous.value, previous.originalValue, objectEqualsTracking.current) && previous.equals) {
            return previous;
          }
          return {...previous,
            ...{
              value: previous.value,
              originalValue: previous.value,
              equals: true
            }}
        case Actions.RESET_ORIGINAL:
          if (valuesEquals(previous.value, previous.originalValue, objectEqualsTracking.current) && previous.equals) {
            return previous;
          }
          return {...previous,
            ...{
              value: previous.originalValue,
              originalValue: previous.originalValue,
              equals: true
            }}
        case Actions.RESET:
          const resetValue = hasValue(action.value) ? resetValueParserTracking.current ? resetValueParserTracking.current(action.value, previous.value, previous.originalValue) : action.value as ValueType : previous.value;
          if (valuesEquals(previous.value, resetValue, objectEqualsTracking.current) && valuesEquals(previous.originalValue, resetValue, objectEqualsTracking.current) && previous.equals) {
            return previous;
          }
          if (valuesEquals(previous.value, resetValue, objectEqualsTracking.current)) {
            return {...previous,
              ...{
                originalValue: resetValue,
                equals: true,
              }}
          }
          if (valuesEquals(previous.originalValue, resetValue, objectEqualsTracking.current) && previous.equals) {
            return {...previous,
              ...{
                value: resetValue,
                equals: true
              }}
          }
          return {...previous,
            ...{
              value: resetValue,
              originalValue: resetValue,
              equals: true
            }}
      }
    },
    void 0,
    () => ({value: currentValue.current, originalValue: currentValue.current, equals: true} as ReducedState<ValueType>)
  );

  return useMemo(() => {
    return [
      state.value,
      {
        setValue: (newValue: SetterType) => dispatch({value: newValue, action: Actions.SET} ),
        resetValue: (newValue?: ResetType) => dispatch({value: newValue, action: Actions.RESET} ),
        resetToCurrentValue: () => dispatch({ action: Actions.RESET_CURRENT } ),
        resetToOriginalValue: () => dispatch({ action: Actions.RESET_ORIGINAL } )
      },
      {
        equals: state.equals,
        original: state.originalValue
      }
    ]
  }, [state])
}



