/**
 * Bidirectional translator between a domain aggregate and its Postgres ORM row.
 * Keeping this explicit (rather than reusing one class for both) is what lets the
 * domain model and the storage schema evolve independently.
 */
export interface Mapper<TDomain, TOrm> {
  toDomain(entity: TOrm): TDomain;
  toOrm(domain: TDomain): TOrm;
}
