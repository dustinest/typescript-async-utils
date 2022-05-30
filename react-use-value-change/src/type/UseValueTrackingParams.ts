export type UseValueTrackingParams<ValueType extends any = any,
  SetterType = ValueType,
  ResetType = SetterType> =
  {
    initValue: ValueType,
    valueParser: (value: SetterType, currentValue: ValueType, originalValue: ValueType) => ValueType,
    objectEquals: (value1: ValueType, value2: ValueType) => boolean,
    resetValueParser?: (value: ResetType | undefined, currentValue: ValueType, originalValue: ValueType) => ValueType
  };

export type UseValueTrackingResult<ValueType extends any = any,
  SetterType = ValueType,
  ResetType = SetterType> = [
  ValueType,
  {
    setValue: (value: SetterType) => void,
    resetValue: (value?: ResetType) => void,
    resetToCurrentValue: () => void,
    resetToOriginalValue: () => void
  },
  {
    equals: boolean,
    original: ValueType
  }
];
