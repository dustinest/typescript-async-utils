/**
 * Old asynchronized blocking queue
 * @deprecated use PrioritizedAsyncBlockingQueue instead
 */
export interface AsyncBlockingFunctionQueue {
    /**
     * Prioritised queue. This will be run in first priority
     * @param callable
     * @deprecated use PrioritizedAsyncBlockingQueue::primary::enqueue instead
     */
    enqueuePriority<T>(callable: () => Promise<T>): Promise<T>;

    /**
     * Wait until prioritised queue is complete and then run the method
     * This method is a bit biased as it does not block each other and can run in parallel
     * @param callable
     * @deprecated use PrioritizedAsyncBlockingQueue::whenReady::enqueue instead
     */
    enqueue<T>(callable: () => Promise<T>): Promise<T>;
}
