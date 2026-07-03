import { FindingListItem } from '../read-models/finding-list-item.read-model';

/**
 * Query port for the findings read model (the CQRS read side). An in-memory
 * adapter backs it today; a Postgres projection will implement it later. Distinct
 * from the write-side `FindingRepository`, which loads/saves aggregates.
 */
export interface FindingReadStore {
  listWorklist(): Promise<FindingListItem[]>;
}

/** DI token for {@link FindingReadStore} (interfaces have no runtime value). */
export const FINDING_READ_STORE = Symbol('FindingReadStore');
