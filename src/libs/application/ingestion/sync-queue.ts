/** A request to run one connector sync. */
export interface SyncJob {
  readonly sourceId: string;
  readonly assessmentId?: string;
}

/**
 * Port for enqueuing sync work. THE decoupling seam between "trigger a sync"
 * (API / scheduler) and "run a sync" (worker). An in-process adapter runs jobs
 * inline (monolith mode); a Redis/BullMQ adapter runs them on a worker pool —
 * swapping one for the other is a deployment choice, not a code change.
 */
export interface SyncQueue {
  enqueue(job: SyncJob): Promise<void>;
}
