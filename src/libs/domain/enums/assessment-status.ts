/**
 * Lifecycle of an {@link Assessment} (the scan-grouping aggregate, an
 * "engagement" in some tools).
 */
export enum AssessmentStatus {
  Planned = 'PLANNED',
  InProgress = 'IN_PROGRESS',
  OnHold = 'ON_HOLD',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}
