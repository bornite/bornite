/**
 * Lifecycle of a single {@link ScanImport} — the ingestion of one scan
 * result-set (file upload or API pull) into the platform.
 */
export enum ScanImportStatus {
  /** Received, not yet parsed. */
  Pending = 'PENDING',
  /** Parsing / reconciling findings. */
  Processing = 'PROCESSING',
  /** Successfully ingested. */
  Completed = 'COMPLETED',
  /** Ingestion failed (parse error, etc.). */
  Failed = 'FAILED',
}
