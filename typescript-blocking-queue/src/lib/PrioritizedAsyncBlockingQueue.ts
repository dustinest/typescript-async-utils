import {TicketQueue} from "../type/TicketQueue";
import {AsyncQueue, PrioritizedAsyncBlockingQueue} from "../type/PrioritizedAsyncBlockingQueue";
import {newBlockingTicketQueue} from "./BlockingTicketQueue";

type DependantQueueSize = () => number;
const DUMMY_EMPTY_QUEUE: DependantQueueSize = Object.freeze(() => 0);
const buildDependantQueue = (dependantQueueList: TicketQueue[]): DependantQueueSize => {
  if (dependantQueueList.length === 0) return DUMMY_EMPTY_QUEUE;
  return () => dependantQueueList.reduce((result, q) => result + q.size(), 0);
}

const waitMyTurn = (canRun: () => boolean): Promise<void> => new Promise<void>((resolve, reject) => {
  if (canRun()) return resolve();
  const resolveMyTurn = () => {
    if (!canRun()) {
      setTimeout(resolveMyTurn, 1);
      return;
    }
    try {
      resolve();
    } catch (error) {
      reject(error);
    }
  };
  resolveMyTurn();
});

const getAsyncQueue = (dependantQueue: DependantQueueSize, ticketQueue?: TicketQueue): AsyncQueue => {
  let jobs: number = 0;
  return {
    async enqueue<ResultType = any>(callable: () => Promise<ResultType>): Promise<ResultType> {
      try {
        jobs ++;
        if (ticketQueue !== undefined) {
          const ticket = ticketQueue.reserve();
          try {
            await waitMyTurn(() => dependantQueue() === 0 && ticketQueue.isMyTurn(ticket));
            return await callable();
          } finally {
            ticketQueue.done(ticket);
          }
        } else {
          await waitMyTurn(() => dependantQueue() === 0);
          return await callable();
        }
      } finally {
        jobs --;
      }
    },
    jobsWaiting(): number { return dependantQueue() + jobs; },
    jobsInQueue(): number { return jobs; }
  } as AsyncQueue;
}

const checkNumber = (value: number | null | undefined, defaultValue: number): number => {
  if (value === null || value === undefined) return defaultValue;
  if (Number.isNaN(value)) throw new Error(`Value ${value} provided should not be Number.NaN!`);
  return value;
}

class PrioritizedAsyncBlockingQueueImpl implements PrioritizedAsyncBlockingQueue {
  private readonly queueList: AsyncQueue[];

  constructor(size: number, ticketQueue: TicketQueue[]) {
    const queueList:AsyncQueue[] = [];
    for (let i = 0; i < size; i++) {
      queueList.push(
        getAsyncQueue(
          buildDependantQueue(ticketQueue.filter((e, index) => index < i)),
          ticketQueue[i]
        )
      );
    }
    queueList.push(getAsyncQueue(buildDependantQueue(ticketQueue)))
    this.queueList = queueList;
  }

  prioritized(index?: number): AsyncQueue {
    const realIndex = checkNumber(index, 0);
    if (realIndex > this.queueList.length - 2) {
      throw new Error(`Index ${index} exceeds the queue size ${this.queueList.length - 2}!`)
    }
    return this.queueList[realIndex];
  }

  size(): number {
    return this.queueList.length - 1;
  }

  jobsWaiting(): number {
    return this.queueList.reduce((result, value) => result + value.jobsInQueue(), 0);
  }

  whenReady(): AsyncQueue {
    return this.queueList[this.queueList.length - 1];
  }
}

export const newPrioritizedBlockingQueue = (size?: number, ...ticketQueue: TicketQueue[]): PrioritizedAsyncBlockingQueue => {
  const realSize = checkNumber(size, 1);
  const realTicketQueue:TicketQueue[] = [];
  for (let index = 0; index < realSize; index++) {
    if (ticketQueue === null || ticketQueue === undefined || ticketQueue.length <= index || ticketQueue[index] === null || ticketQueue[index] === undefined) {
      realTicketQueue.push(newBlockingTicketQueue())
    } else {
      realTicketQueue.push(ticketQueue[index])
    }
  }
  return new PrioritizedAsyncBlockingQueueImpl(realSize, realTicketQueue);
}
