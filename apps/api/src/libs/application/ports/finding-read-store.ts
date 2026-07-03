import { FindingListItem } from '../read-models/finding-list-item.read-model';

/**
 * Query port for the findings read model (the CQRS read side). An in-memory
 * adapter backs it today; a Postgres projection will implement it later. Distinct
 * from the write-side `FindingRepository`, which loads/saves aggregates.
 *
 * The DI token lives in `di-tokens.ts`.
 */
export interface FindingReadStore {
  listWorklist(): Promise<FindingListItem[]>;
}
