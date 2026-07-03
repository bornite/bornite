/**
 * Something that happened in the domain worth reacting to. Aggregate roots record
 * events (see {@link AggregateRoot}); an outer layer dispatches them after the
 * transaction commits. Kept deliberately minimal — no bus, no framework.
 */
export interface DomainEvent {
  readonly eventName: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
}
