/** @jest-environment jsdom */

import {renderHook, act} from '@testing-library/react-hooks'
import {AsyncStatus} from "../type/AsyncStatus";
import {useTimeoutAsyncEffect} from './useTimeoutAsyncEffect';
import {AsyncResulError, AsyncResultWorking, AsyncStatusResult} from "../type/UseAsyncResult";
import {TimeoutAsyncStatus} from "../type/TimeoutAsyncStatus";

const resolveLoading = <T>(result: AsyncStatusResult<T>): { status: AsyncStatus.WORKING; } => {
  const {cancel, ...status} = result as AsyncResultWorking<T>;
  return status;
}

const milliseconds = 100;
const waitMilliseconds = milliseconds * 2;
const resultTimeout = 500;
const waitResultTimeout = resultTimeout * 2;

describe('useAsyncEffect()', () => {
  it('should update when deps change', async () => {
    const {result, rerender, waitForNextUpdate} = renderHook(
      ({deps}) => {
        return useTimeoutAsyncEffect<boolean>(
          () => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(deps[0])
              }, resultTimeout)
            })
          },
          deps, {milliseconds})
      }
      ,
      {
        initialProps: {deps: [true]},
      }
    );
    expect(resolveLoading(result.current)).toStrictEqual({status: TimeoutAsyncStatus.SCHEDULED});
    act(() => {
      jest.advanceTimersByTime(waitMilliseconds)
    });
    expect(resolveLoading(result.current)).toStrictEqual({status: AsyncStatus.WORKING});
    act(() => {
      jest.advanceTimersByTime(waitResultTimeout)
    });
    await waitForNextUpdate();
    expect(result.current).toStrictEqual({status: AsyncStatus.SUCCESS, value: true});
    rerender({deps: [false]});
    // We still need the timeout to kick in
    expect(resolveLoading(result.current)).toStrictEqual({status: TimeoutAsyncStatus.SCHEDULED, value: true});
    act(() => {
      jest.advanceTimersByTime(waitMilliseconds);
    });
    // Yes, this value should be persisted and not reset
    expect(resolveLoading(result.current)).toStrictEqual({status: AsyncStatus.WORKING, value: true});
    act(() => {
      jest.advanceTimersByTime(waitResultTimeout);
    });
    await waitForNextUpdate();
    expect(resolveLoading(result.current)).toStrictEqual({status: AsyncStatus.SUCCESS, value: false});
  })

  it('should handle thrown exceptions', async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useTimeoutAsyncEffect(async () => {
        throw new Error('Something got wrong!');
      }, [])
    );
    expect(resolveLoading(result.current)).toStrictEqual({status: TimeoutAsyncStatus.SCHEDULED});
    act(() => {
      jest.advanceTimersByTime(waitMilliseconds);
    });
    await waitForNextUpdate()
    const {error, ...others} = resolveLoading(result.current) as any as AsyncResulError<boolean>;
    expect(others).toStrictEqual({status: AsyncStatus.ERROR});
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Something got wrong!')
  })

  it('should handle Promise.reject', async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useTimeoutAsyncEffect(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject('Something got wrong!'), resultTimeout)
          }),
        [], {milliseconds}
      )
    )

    expect(resolveLoading(result.current)).toStrictEqual({status: TimeoutAsyncStatus.SCHEDULED});
    act(() => {
      jest.advanceTimersByTime(waitMilliseconds + waitResultTimeout)
    });
    await waitForNextUpdate()
    const {error, ...others} = resolveLoading(result.current) as any as AsyncResulError<boolean>;
    expect(others).toStrictEqual({status: AsyncStatus.ERROR});
    expect(error).toBe('Something got wrong!')
  })
})
