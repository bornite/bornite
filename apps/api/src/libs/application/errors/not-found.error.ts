/**
 * Raised by a use case when a referenced aggregate does not exist. An
 * application-level concern (not a domain invariant); the HTTP edge maps it to a
 * 404.
 */
export class NotFoundError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
