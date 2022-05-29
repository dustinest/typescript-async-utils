export interface QueueWaitingAware {
  /**
   * How many items are waiting to be executed
   */
  jobsWaiting(): number;
}

export interface AsyncQueue extends QueueWaitingAware {
  /**
   * Enqueue the job to be executed
   */
  enqueue<ResultType = any>(callable: () => Promise<ResultType>): Promise<ResultType>;

  /**
   * returns number of jobs in this queue
   */
  jobsInQueue(): number;
}

export interface PrioritizedAsyncBlockingQueue extends QueueWaitingAware {
  /**
   * @param index lower the number then higher is the priority. Must not exceed queue size
   * @throws Error when queue size is exceeded
   */
  prioritized(index?: number): AsyncQueue;

  /**
   * The amount of prioritized workers
   */
  size(): number;

  /**
   * Runs callable when primary and secondary queue-s are all done
   */
  whenReady(): AsyncQueue;
}
