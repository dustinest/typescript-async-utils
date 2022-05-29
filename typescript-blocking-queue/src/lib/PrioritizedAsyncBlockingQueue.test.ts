import {newPrioritizedBlockingQueue} from "./PrioritizedAsyncBlockingQueue";
import {PrioritizedAsyncBlockingQueue} from "../type/PrioritizedAsyncBlockingQueue";

const getAnalytics = (queue: PrioritizedAsyncBlockingQueue) => {
  return () => {
    const result = {
      size: queue.size(),
      waiting: queue.jobsWaiting(),
      unPrioritized: {
        jobs: queue.whenReady().jobsInQueue(),
        queue: queue.whenReady().jobsWaiting()
      },
      prioritized: [] as {priority: number, queue: number, waiting: number} []
    }
    for (let i = 0; i < queue.size(); i++) {
      result.prioritized.push(
        {
          priority: i,
          queue: queue.prioritized(i).jobsInQueue(),
          waiting: queue.prioritized(i).jobsWaiting()
        }
      )
    }
    return result;
  };
}

const resolveInFuture = (callable: () => string, timeout: number) => () => new Promise<string>((resolve) => setTimeout(() => resolve(callable()), timeout))
const resolveInMilliseconds = (callable: () => string) => resolveInFuture(callable, 100);
const inFuture = (result: string) => resolveInMilliseconds(() => result);

describe("Blocking promise works", () => {
  it("When queue has single priority", async () => {
    const queue = newPrioritizedBlockingQueue(1);
    const analytics = getAnalytics(queue);
    expect(analytics()).toStrictEqual({size: 1, waiting: 0, unPrioritized: {jobs: 0, queue: 0}, prioritized: [{priority: 0, queue: 0, waiting: 0}]})

    const prioritizedJob1 = queue.prioritized(0).enqueue(inFuture("prioritizedJob1 OK"));
    expect(analytics()).toStrictEqual({size: 1, waiting: 1, unPrioritized: {jobs: 0, queue: 1}, prioritized: [{priority: 0, queue: 1, waiting: 1}]})

    const unPrioritizedJob1 = queue.whenReady().enqueue(inFuture("unPrioritizedJob1 OK"));
    expect(analytics()).toStrictEqual({size: 1, waiting: 2, unPrioritized: {jobs: 1, queue: 2}, prioritized: [{priority: 0, queue: 1, waiting: 1}]})

    const prioritizedJob2 = queue.prioritized(0).enqueue(inFuture("prioritizedJob2 OK"));
    expect(analytics()).toStrictEqual({size: 1, waiting: 3, unPrioritized: {jobs: 1, queue: 3}, prioritized: [{priority: 0, queue: 2, waiting: 2}]})

    const unPrioritizedJob2 = queue.whenReady().enqueue(inFuture("unPrioritizedJob2 OK"));
    expect(analytics()).toStrictEqual({size: 1, waiting: 4, unPrioritized: {jobs: 2, queue: 4}, prioritized: [{priority: 0, queue: 2, waiting: 2}]})

    const prioritizedJob3 = queue.prioritized(0).enqueue(inFuture("prioritizedJob3 OK"));
    expect(analytics()).toStrictEqual({size: 1, waiting: 5, unPrioritized: {jobs: 2, queue: 5}, prioritized: [{priority: 0, queue: 3, waiting: 3}]})

    const prioritizedResult1 = await prioritizedJob1;
    expect(analytics()).toStrictEqual({size: 1, waiting: 4, unPrioritized: {jobs: 2, queue: 4}, prioritized: [{priority: 0, queue: 2, waiting: 2}]})
    expect(prioritizedResult1).toBe("prioritizedJob1 OK")
    const prioritizedResult2 = await prioritizedJob2;
    expect(analytics()).toStrictEqual({size: 1, waiting: 3, unPrioritized: {jobs: 2, queue: 3}, prioritized: [{priority: 0, queue: 1, waiting: 1}]})
    expect(prioritizedResult2).toBe("prioritizedJob2 OK")

    const allResults = await Promise.all([prioritizedJob1, unPrioritizedJob1, prioritizedJob2, unPrioritizedJob2, prioritizedJob3]);
    expect(allResults).toStrictEqual(["prioritizedJob1 OK", "unPrioritizedJob1 OK", "prioritizedJob2 OK", "unPrioritizedJob2 OK", "prioritizedJob3 OK"]);
    expect(analytics()).toStrictEqual({size: 1, waiting: 0, unPrioritized: {jobs: 0, queue: 0}, prioritized: [{priority: 0, queue: 0, waiting: 0}]})
  });

  it("When queue has blocking calls mixed with unblocking calls", async () => {
    const queue = newPrioritizedBlockingQueue(3);
    const analytics = getAnalytics(queue);
    expect(analytics()).toStrictEqual({
      size: 3,
      waiting: 0,
      unPrioritized: {jobs: 0, queue: 0},
      prioritized: [
        {priority: 0, queue: 0, waiting: 0},
        {priority: 1, queue: 0, waiting: 0},
        {priority: 2, queue: 0, waiting: 0}
      ]
    });

    const executionResult: string[] = [];

    const jobs = [1, 2, 3, 4, 5].flatMap(value => {
      return [
        queue.whenReady().enqueue(resolveInMilliseconds(() => {
          const key = `unblocking future ${value}`;
          executionResult.push(key);
          return key;
        })),
        queue.whenReady().enqueue(async () => {
          const key = `unblocking ${value}`;
          executionResult.push(key);
          return key;
        }),
        queue.whenReady().enqueue(resolveInFuture(() => {
          const key = `unblocking in 50 ${value}`;
          executionResult.push(key);
          return key;
        }, 50)),
        queue.prioritized(0).enqueue(async () => {
          const key = `blocking[0] ${value}`;
          executionResult.push(key);
          return key;
        }),
        queue.prioritized(0).enqueue(resolveInMilliseconds( () => {
          const key = `blocking[0] future${value}`;
          executionResult.push(key);
          return key;
        })),
        queue.prioritized(1).enqueue(async () => {
          const key = `blocking[1] ${value}`;
          executionResult.push(key);
          return key;
        }),
        queue.prioritized(1).enqueue(resolveInMilliseconds( () => {
          const key = `blocking[1] future ${value}`;
          executionResult.push(key);
          return key;
        })),
        queue.prioritized(2).enqueue(async () => {
          const key = `blocking[2] ${value}`;
          executionResult.push(key);
          return key;
        }),
      ]
    });
    expect(analytics()).toStrictEqual({
      size: 3,
      waiting: 40,
      unPrioritized: {jobs: 15, queue: 40},
      prioritized: [
        {priority: 0, queue: 10, waiting: 10},
        {priority: 1, queue: 10, waiting: 20},
        {priority: 2, queue: 5, waiting: 25}
      ]
    });
    const promiseResult = await Promise.all(jobs)
    expect(promiseResult).toStrictEqual(
      [
        "unblocking future 1",
        "unblocking 1",
        "unblocking in 50 1",
        "blocking[0] 1",
        "blocking[0] future1",
        "blocking[1] 1",
        "blocking[1] future 1",
        "blocking[2] 1",
        "unblocking future 2",
        "unblocking 2",
        "unblocking in 50 2",
        "blocking[0] 2",
        "blocking[0] future2",
        "blocking[1] 2",
        "blocking[1] future 2",
        "blocking[2] 2",
        "unblocking future 3",
        "unblocking 3",
        "unblocking in 50 3",
        "blocking[0] 3",
        "blocking[0] future3",
        "blocking[1] 3",
        "blocking[1] future 3",
        "blocking[2] 3",
        "unblocking future 4",
        "unblocking 4",
        "unblocking in 50 4",
        "blocking[0] 4",
        "blocking[0] future4",
        "blocking[1] 4",
        "blocking[1] future 4",
        "blocking[2] 4",
        "unblocking future 5",
        "unblocking 5",
        "unblocking in 50 5",
        "blocking[0] 5",
        "blocking[0] future5",
        "blocking[1] 5",
        "blocking[1] future 5",
        "blocking[2] 5"
      ]
    );
    expect(executionResult).toStrictEqual(
      [
        "unblocking 1",
        "blocking[0] 1",
        "unblocking in 50 1",
        "unblocking future 1",
        "blocking[0] future1",
        "blocking[0] 2",
        "blocking[0] future2",
        "blocking[0] 3",
        "blocking[0] future3",
        "blocking[0] 4",
        "blocking[0] future4",
        "blocking[0] 5",
        "blocking[0] future5",
        "blocking[1] 1",
        "blocking[1] future 1",
        "blocking[1] 2",
        "blocking[1] future 2",
        "blocking[1] 3",
        "blocking[1] future 3",
        "blocking[1] 4",
        "blocking[1] future 4",
        "blocking[1] 5",
        "blocking[1] future 5",
        "blocking[2] 1",
        "blocking[2] 2",
        "blocking[2] 3",
        "blocking[2] 4",
        "blocking[2] 5",
        "unblocking 2",
        "unblocking 3",
        "unblocking 4",
        "unblocking 5",
        "unblocking in 50 2",
        "unblocking in 50 3",
        "unblocking in 50 4",
        "unblocking in 50 5",
        "unblocking future 2",
        "unblocking future 3",
        "unblocking future 4",
        "unblocking future 5"
      ]
    );

    expect(analytics()).toStrictEqual({
      size: 3,
      waiting: 0,
      unPrioritized: {jobs: 0, queue: 0},
      prioritized: [
        {priority: 0, queue: 0, waiting: 0},
        {priority: 1, queue: 0, waiting: 0},
        {priority: 2, queue: 0, waiting: 0}
      ]
    });
  });

  it("Errors do not stop us", async () => {
    const queue = newPrioritizedBlockingQueue();
    const analytics = getAnalytics(queue);
    expect(analytics()).toStrictEqual({size: 1, waiting: 0, unPrioritized: {jobs: 0, queue: 0}, prioritized: [{priority: 0, queue: 0, waiting: 0}]})

    const executionResult: string[] = [];
    const errorResults: string[] = [];

    const promiseResult = await Promise.all([
      queue.prioritized(0).enqueue(async () => {
        const key = `result1`;
        executionResult.push(key);
        return key;
      }),
      queue.whenReady().enqueue(async () => {
        const key = `unblocking_error1`;
        executionResult.push(key);
        throw new Error(`${key}`);
      }).catch((e: Error) => errorResults.push(e.message)),
      queue.prioritized(0).enqueue(async () => {
        const key = `blocking_error2`;
        executionResult.push(key);
        throw new Error(`${key}`);
      }).catch((e: Error) => errorResults.push(e.message)),
      queue.whenReady().enqueue(async () => {
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
    expect(analytics()).toStrictEqual({size: 1, waiting: 0, unPrioritized: {jobs: 0, queue: 0}, prioritized: [{priority: 0, queue: 0, waiting: 0}]})
  })
});
