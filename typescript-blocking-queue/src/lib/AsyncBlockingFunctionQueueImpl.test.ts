import {newBlockingPromiseQueue} from "./AsyncBlockingFunctionQueueImpl";

describe("Blocking promise works", () => {
  it("Empty queue can be called", async () => {
    const blockingPromiseQueue = newBlockingPromiseQueue();
    const waitingResult1 = await blockingPromiseQueue.enqueue(() =>
      Promise.resolve("abc")
    );
    expect(waitingResult1).toBe("abc");
  });

  it("When queue has blocking calls mixed with unblocking calls", async () => {
    const blockingPromiseQueue = newBlockingPromiseQueue();
    const executionResult: string[] = [];

    const promiseResult = await Promise.all([1, 2, 3, 4, 5].flatMap(value => {
      return [
        blockingPromiseQueue.enqueue<string>(async () => {
          const key = `unblocking_${value}`;
          executionResult.push(key);
          return key;
        }),
        blockingPromiseQueue.enqueuePriority<string>(() => new Promise<string>(resolve => {
          setTimeout(() => {
            const key = `blocking_${value}`
            executionResult.push(key);
            resolve(key);
          }, 1);
        }))
      ]
    }));

    expect(promiseResult).toStrictEqual([
      "unblocking_1",
      "blocking_1",
      "unblocking_2",
      "blocking_2",
      "unblocking_3",
      "blocking_3",
      "unblocking_4",
      "blocking_4",
      "unblocking_5",
      "blocking_5"
    ]);
    expect(executionResult).toStrictEqual([
      "unblocking_1",
      "blocking_1",
      "blocking_2",
      "blocking_3",
      "blocking_4",
      "blocking_5",
      "unblocking_2",
      "unblocking_3",
      "unblocking_4",
      "unblocking_5"
    ]);
  });

  it("Errors do not stop us", async () => {
    const blockingPromiseQueue = newBlockingPromiseQueue();
    const executionResult: string[] = [];
    const errorResults: string[] = [];

    const promiseResult = await Promise.all([
      blockingPromiseQueue.enqueuePriority(async () => {
        const key = `result1`;
        executionResult.push(key);
        return key;
      }),
      blockingPromiseQueue.enqueue(async () => {
        const key = `unblocking_error1`;
        executionResult.push(key);
        throw new Error(`${key}`);
      }).catch((e: Error) => errorResults.push(e.message)),
      blockingPromiseQueue.enqueuePriority(async () => {
        const key = `blocking_error2`;
        executionResult.push(key);
        throw new Error(`${key}`);
      }).catch((e: Error) => errorResults.push(e.message)),
      blockingPromiseQueue.enqueue(async () => {
        const key = `result2`;
        executionResult.push(key);
        return key;
      })
    ]);


    expect(promiseResult).toStrictEqual(["result1", 2, 1, "result2"]);

    expect(executionResult).toStrictEqual([
      "result1",
      "blocking_error2",
      "result2",
      "unblocking_error1"
    ]);

    expect(errorResults).toStrictEqual(["blocking_error2", "unblocking_error1"])
  })
});
