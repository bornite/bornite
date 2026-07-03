/**
 * Base class for all errors raised by the domain layer.
 *
 * Domain errors represent violations of business rules or invariants. They are
 * intentionally free of any framework/HTTP coupling — an outer layer decides how
 * to translate them (e.g. into a 400/409 response).
 */
export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    // Restore prototype chain when targeting ES5/ES2021 with class extends of Error.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Raised when a value object / entity is constructed with an invalid argument. */
export class InvalidArgumentError extends DomainError {
  public constructor(message: string) {
    super(message);
  }
}

/** Raised when an operation would violate a business rule / invariant. */
export class BusinessRuleViolationError extends DomainError {
  public constructor(message: string) {
    super(message);
  }
}

/** Raised when a state transition is not allowed from the current state. */
export class IllegalStateTransitionError extends BusinessRuleViolationError {
  public constructor(message: string) {
    super(message);
  }
}
