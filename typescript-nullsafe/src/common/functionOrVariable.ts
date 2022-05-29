type ProviderType<T> = () => T;
export type FunctionOrVariable<T> = NonNullable<T> | ProviderType<NonNullable<T>>;

export const resolveFunctionOrVariable = <T>(value: FunctionOrVariable<T>): T => {
  if (value instanceof Function) return value();
  return value;
}
