import { z } from 'zod';
import { SEVERITY_RANK, SeverityLevel } from '../enums/severity-level';
import { InvalidArgumentError } from '../shared/domain-error';
import { parse } from '../shared/parse';
import { ValueObject } from '../shared/value-object';

const LABEL_SYNONYMS: Readonly<Record<string, SeverityLevel>> = {
  critical: SeverityLevel.Critical,
  high: SeverityLevel.High,
  medium: SeverityLevel.Medium,
  moderate: SeverityLevel.Medium,
  warning: SeverityLevel.Medium,
  low: SeverityLevel.Low,
  minor: SeverityLevel.Low,
  info: SeverityLevel.Info,
  informational: SeverityLevel.Info,
  information: SeverityLevel.Info,
  none: SeverityLevel.Info,
  negligible: SeverityLevel.Info,
  unknown: SeverityLevel.Info,
};

const cvssScoreSchema = z.number().min(0).max(10);

/**
 * A qualitative severity band as a comparable value object. Wraps a
 * {@link SeverityLevel} and adds ordering plus derivation from a CVSS base score
 * or an arbitrary scanner label.
 */
export class Severity extends ValueObject {
  private constructor(public readonly level: SeverityLevel) {
    super();
    Object.freeze(this);
  }

  public static of(level: SeverityLevel): Severity {
    return new Severity(level);
  }

  /**
   * Parse a scanner-supplied label (e.g. "Moderate", "informational") into a
   * severity. Throws for labels that cannot be mapped.
   */
  public static fromLabel(label: string): Severity {
    const level = LABEL_SYNONYMS[label.trim().toLowerCase()];
    if (level === undefined) {
      throw new InvalidArgumentError(`Unrecognised severity label: "${label}".`);
    }
    return new Severity(level);
  }

  /**
   * Map a CVSS base score (0.0–10.0) to a qualitative band per the CVSS v3.x
   * qualitative severity rating scale.
   */
  public static fromCvssScore(score: number): Severity {
    const value = parse(cvssScoreSchema, score, 'CVSS score');
    if (value === 0) {
      return new Severity(SeverityLevel.Info);
    }
    if (value < 4) {
      return new Severity(SeverityLevel.Low);
    }
    if (value < 7) {
      return new Severity(SeverityLevel.Medium);
    }
    if (value < 9) {
      return new Severity(SeverityLevel.High);
    }
    return new Severity(SeverityLevel.Critical);
  }

  /** Internal ranking (higher = more severe). Not a CVSS score. */
  public get rank(): number {
    return SEVERITY_RANK[this.level];
  }

  public isAtLeast(other: Severity): boolean {
    return this.rank >= other.rank;
  }

  public isHigherThan(other: Severity): boolean {
    return this.rank > other.rank;
  }

  /** Returns the more severe of the two. */
  public static max(a: Severity, b: Severity): Severity {
    return a.rank >= b.rank ? a : b;
  }
}
