export type CancellablePromise<ValueType extends any = any> = {
  cancel: () => void;
} & Promise<ValueType>;
