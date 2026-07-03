import { z } from 'zod';
import { InvalidArgumentError } from '../shared/domain-error';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';
import { ValueObject } from '../shared/value-object';

/** Supported CVSS vector versions. */
export type CvssVersion = '2.0' | '3.0' | '3.1' | '4.0';

const scoreSchema = z.number().min(0).max(10);

const VERSION_PREFIX: Readonly<Record<CvssVersion, string>> = {
  '2.0': '',
  '3.0': 'CVSS:3.0/',
  '3.1': 'CVSS:3.1/',
  '4.0': 'CVSS:4.0/',
};

function detectVersion(vector: string): CvssVersion {
  if (vector.startsWith(VERSION_PREFIX['4.0'])) {
    return '4.0';
  }
  if (vector.startsWith(VERSION_PREFIX['3.1'])) {
    return '3.1';
  }
  if (vector.startsWith(VERSION_PREFIX['3.0'])) {
    return '3.0';
  }
  // CVSS v2 vectors carry no version prefix; accept them as a best effort.
  if (/^AV:[NAL]/.test(vector)) {
    return '2.0';
  }
  throw new InvalidArgumentError(`Unrecognised CVSS vector: "${vector}".`);
}

/**
 * A CVSS vector string plus its version and (optionally) a supplied base score.
 *
 * Deliberately does NOT compute the score from the vector — full CVSS math is a
 * pluggable concern that lives outside the domain kernel. We validate the vector
 * shape and carry whatever score the caller/source provided.
 */
export class CvssVector extends ValueObject {
  private constructor(
    public readonly version: CvssVersion,
    public readonly vector: string,
    public readonly baseScore: number | null,
  ) {
    super();
    Object.freeze(this);
  }

  public static create(vector: string, baseScore?: number): CvssVector {
    const trimmed = parse(nonEmptyString, vector, 'CVSS vector');
    const version = detectVersion(trimmed);
    const score = baseScore === undefined ? null : parse(scoreSchema, baseScore, 'CVSS score');
    return new CvssVector(version, trimmed, score);
  }

  public hasScore(): boolean {
    return this.baseScore !== null;
  }
}
