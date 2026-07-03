/**
 * Base class for value objects: immutable, identity-less descriptors compared by
 * their attributes rather than by reference.
 *
 * Concrete value objects declare their data as `public readonly` fields, validate
 * in a static factory (via Zod — see `parse`), and call `Object.freeze(this)` in
 * their constructor to lock the instance. Equality is structural over the stored
 * fields.
 */
export abstract class ValueObject {
  public equals(other?: ValueObject | null): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (other.constructor !== this.constructor) {
      return false;
    }
    // Structural equality over own enumerable fields. Methods and getters live on
    // the prototype and are not serialised; field declaration order is stable.
    return JSON.stringify(this) === JSON.stringify(other);
  }
}
