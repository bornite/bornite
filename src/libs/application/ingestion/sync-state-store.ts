/** Per-source incremental sync state (the cursor/watermark). */
export interface SyncState {
  readonly sourceId: string;
  readonly cursor: string | null;
  readonly lastSyncedAt: Date | null;
}

/**
 * Persistence port for connector sync cursors, so a pull connector fetches only
 * what changed since the last successful run instead of everything.
 */
export interface SyncStateStore {
  load(sourceId: string): Promise<SyncState | null>;
  save(state: SyncState): Promise<void>;
}
