import { z } from 'zod';
import { parse } from '../shared/parse';
import { ValueObject } from '../shared/value-object';

const idSchema = z.number().int().positive();

/**
 * A CWE (Common Weakness Enumeration) reference, e.g. CWE-79 (XSS).
 *
 * Legacy tools store the CWE as a bare integer on the finding, disconnected from
 * any catalog. We keep the number as the identity and allow an optional human
 * name to travel with it.
 */
export class Cwe extends ValueObject {
  private constructor(
    public readonly id: number,
    public readonly name: string | null,
  ) {
    super();
    Object.freeze(this);
  }

  public static create(id: number, name?: string): Cwe {
    return new Cwe(parse(idSchema, id, 'CWE id'), name?.trim() || null);
  }

  public get code(): string {
    return `CWE-${this.id}`;
  }

  public override toString(): string {
    return this.code;
  }
}
