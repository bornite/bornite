import { DomainEvent } from './domain-event';
import { Entity } from './entity';

/**
 * An aggregate root is the single entry-point to an aggregate — a cluster of
 * objects treated as one consistency boundary. Only roots are loaded and saved
 * by repositories, and cross-aggregate references are held by id (never by
 * object reference) so that each aggregate can be persisted independently.
 *
 * Roots collect domain events that an outer layer pulls and dispatches after the
 * unit of work commits.
 */
export abstract class AggregateRoot<TProps> extends Entity<TProps> {
  private _domainEvents: DomainEvent[] = [];

  public get domainEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /** Returns and clears the recorded events. Call once, at commit time. */
  public pullDomainEvents(): DomainEvent[] {
    const events = this._domainEvents;
    this._domainEvents = [];
    return events;
  }
}
