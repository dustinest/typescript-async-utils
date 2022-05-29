export type UseAsyncProps = {
  useInit?: boolean; // when set to true then INIT phase is shown otherwise WORKING is used
}
export type UseTimeoutAsyncProps = {
  milliseconds?: number;
} & UseAsyncProps;
