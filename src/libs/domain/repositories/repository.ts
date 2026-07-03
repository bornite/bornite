/**
 * Generic persistence port for an aggregate root. Concrete implementations live
 * in the infrastructure layer (e.g. Postgres); the domain depends only on this
 * interface — classic dependency inversion.
 *
 * `save` is an upsert of the whole aggregate (create or update).
 */
export interface Repository<TAggregate, TId = string> {
  findById(id: TId): Promise<TAggregate | null>;
  save(aggregate: TAggregate): Promise<void>;
  delete(id: TId): Promise<void>;
}
