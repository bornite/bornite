import { SyncJob, SyncQueue } from '../../application';

/**
 * Monolith-mode queue: runs each job inline, in-process, immediately. Useful for
 * development and single-node deploys. Swap for a Redis/BullMQ-backed adapter to
 * get a real worker pool, retries and backpressure — the {@link SyncQueue} port
 * stays identical.
 */
export class InlineSyncQueue implements SyncQueue {
  public constructor(private readonly handler: (job: SyncJob) => Promise<void>) {}

  public async enqueue(job: SyncJob): Promise<void> {
    await this.handler(job);
  }
}
