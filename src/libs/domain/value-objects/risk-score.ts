import { z } from 'zod';
import { parse } from '../shared/parse';
import { ValueObject } from '../shared/value-object';

/** Qualitative band derived from a numeric risk score. */
export type RiskBand = 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const schema = z.number().min(0).max(100);

/**
 * A computed, prioritisation-oriented risk score on a fixed 0–100 scale.
 *
 * This is intentionally NOT the CVSS score. It is the output of a pluggable
 * risk-scoring strategy (see `RiskScoringStrategy`) that blends severity,
 * exploitability (EPSS/KEV), asset criticality and business context. Findings
 * store the resulting {@link RiskScore}; the domain never hardcodes how it is
 * produced.
 */
export class RiskScore extends ValueObject {
  public static readonly MIN = 0;
  public static readonly MAX = 100;

  private constructor(public readonly value: number) {
    super();
    Object.freeze(this);
  }

  public static of(value: number): RiskScore {
    const parsed = parse(schema, value, 'Risk score');
    return new RiskScore(Math.round(parsed * 100) / 100);
  }

  public get band(): RiskBand {
    if (this.value >= 90) {
      return 'CRITICAL';
    }
    if (this.value >= 70) {
      return 'HIGH';
    }
    if (this.value >= 40) {
      return 'MEDIUM';
    }
    if (this.value >= 10) {
      return 'LOW';
    }
    return 'MINIMAL';
  }

  public isHigherThan(other: RiskScore): boolean {
    return this.value > other.value;
  }
}
