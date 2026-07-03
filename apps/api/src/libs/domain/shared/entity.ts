/**
 * Base class for entities: objects with a stable identity and a lifecycle.
 *
 * Identity — not attribute equality — defines an entity. Two entities are equal
 * iff they share the same id, regardless of their other attributes.
 *
 * Ids are supplied from the outside (application/persistence layer) rather than
 * generated here, so the domain stays free of any I/O or non-determinism.
 */
export abstract class Entity<TProps> {
  protected readonly _id: string;
  protected readonly props: TProps;

  protected constructor(props: TProps, id: string) {
    this._id = id;
    this.props = props;
  }

  public get id(): string {
    return this._id;
  }

  /**
   * A shallow, read-only copy of the entity's state. Intended for the persistence
   * mapper to read every field (including those without a public getter) when
   * translating an aggregate to its ORM row — without exposing mutable internals.
   * Nested value objects are returned as-is; the mapper serialises them.
   */
  public snapshot(): Readonly<TProps> {
    return { ...this.props };
  }

  public equals(other?: Entity<TProps>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this._id === other._id;
  }
}
