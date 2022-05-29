/** @jest-environment jsdom */

import {renderHook, act} from '@testing-library/react-hooks'
import {AsyncStatus} from "../type/AsyncStatus";
import {AsyncResulError, AsyncResultWorking, AsyncStatusResult} from '../type/UseAsyncResult';
import { useAsyncEffect } from './useAsyncEffect';

const resolveWorking = (result: AsyncStatusResult) => {
  const {cancel, ...status} = result as AsyncResultWorking;
  return status;
}

const resultTimeout = 1000;
const waitResultTimeout = resultTimeout * 2;

describe('useAsyncEffect()', () => {
  it('should update when deps change', async () => {
    const {result, rerender, waitForNextUpdate} = renderHook(
      ({deps}) =>
        useAsyncEffect<boolean>(
          () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve(deps[0])
              }, resultTimeout)
            }),
          deps
        ),
      {
        initialProps: {deps: [true]},
      }
    );
    expect(resolveWorking(result.current)).toStrictEqual({ status :AsyncStatus.WORKING });
    act(() => { jest.advanceTimersByTime(waitResultTimeout) });
    await waitForNextUpdate();
    expect(result.current).toStrictEqual({ status: AsyncStatus.SUCCESS, value: true });
    rerender({deps: [false]});
    // Yes, this value should be persisted and not reset
    expect(resolveWorking(result.current)).toStrictEqual({ status :AsyncStatus.WORKING, value: true });
    act(() => { jest.advanceTimersByTime(waitResultTimeout); });
    await waitForNextUpdate();
    expect(resolveWorking(result.current)).toStrictEqual({ status :AsyncStatus.SUCCESS, value: false });
  })

  it('should handle thrown exceptions', async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useAsyncEffect(async () => {
        throw new Error('Something got wrong!');
      }, [])
    );
    expect(resolveWorking(result.current)).toStrictEqual({ status :AsyncStatus.WORKING });
    await waitForNextUpdate()
    const {error, ...others} = resolveWorking(result.current) as any as AsyncResulError<boolean>;
    expect(others).toStrictEqual({ status :AsyncStatus.ERROR });
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Something got wrong!')
  })

  it('should handle Promise.reject', async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useAsyncEffect(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject('Something got wrong!'), resultTimeout)
          }),
        []
      )
    )

    expect(resolveWorking(result.current)).toStrictEqual({ status :AsyncStatus.WORKING });
    act(() => { jest.advanceTimersByTime(waitResultTimeout) });
    await waitForNextUpdate()
    const {error, ...others} = resolveWorking(result.current) as any as AsyncResulError<boolean>;
    expect(others).toStrictEqual({ status: AsyncStatus.ERROR });
    expect(error).toBe('Something got wrong!')
  })
})
