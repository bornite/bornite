/**
 * Port for reading the current time. Injected so use cases and the ingestion
 * pipeline stay deterministic/testable — the domain never calls `new Date()`
 * itself (see the timestamps threaded through entity methods).
 */
export interface Clock {
  now(): Date;
}
