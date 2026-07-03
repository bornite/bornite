import { z } from 'zod';
import { parse } from '../shared/parse';
import { ValueObject } from '../shared/value-object';

const schema = z.string().trim().toLowerCase().min(1, 'must not be empty');

/**
 * A deterministic deduplication key for a {@link Finding} — Bornite's finding
 * hash / dedup key.
 *
 * Crucially it holds a **canonical composite string**, not a cryptographic
 * digest: hashing pulls in a platform primitive (`crypto`) that has no place in a
 * pure domain kernel, and would also throw away the human-readable provenance of
 * the key. The persistence layer is free to store `sha256(value)` in a
 * fixed-width, indexed column.
 *
 * How the value is composed is a pluggable concern — see `FindingFingerprintStrategy`.
 */
export class FindingFingerprint extends ValueObject {
  private constructor(public readonly value: string) {
    super();
    Object.freeze(this);
  }

  public static of(value: string): FindingFingerprint {
    return new FindingFingerprint(parse(schema, value, 'Finding fingerprint'));
  }

  public override toString(): string {
    return this.value;
  }
}
