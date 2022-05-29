import {AsyncBlockingFunctionQueue} from "../type/AsyncBlockingFunctionQueue";
import {TicketQueue} from "../type/TicketQueue";
import {newPrioritizedBlockingQueue} from "./PrioritizedAsyncBlockingQueue";

/**
 * @deprecated by newPrioritizedBlockingQueue
 */
export const newBlockingPromiseQueue = (ticketQueue?: TicketQueue): AsyncBlockingFunctionQueue => {
  console.warn('You are using newBlockingPromiseQueue version of typescript-blocking-queue. Please use newPrioritizedBlockingQueue instead or refer to the manual');
  const queueArgs = ticketQueue !== null && ticketQueue !== undefined ? [ticketQueue] : [];
  const queue = newPrioritizedBlockingQueue(1, ...queueArgs);
  return {
    enqueue<T>(callable: () => Promise<T>): Promise<T> {
      return queue.whenReady().enqueue(callable)
    },
    enqueuePriority<T>(callable: () => Promise<T>): Promise<T> {
      return queue.prioritized().enqueue(callable)
    }
  } as AsyncBlockingFunctionQueue;
}
