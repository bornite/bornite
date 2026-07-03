import { z } from 'zod';
import { parse } from '../shared/parse';
import { ValueObject } from '../shared/value-object';

const probabilitySchema = z.number().min(0).max(1);

/**
 * EPSS (Exploit Prediction Scoring System) data for a vulnerability: the
 * probability of exploitation in the next 30 days and its percentile rank.
 * A key non-CVSS signal for risk-based prioritisation.
 */
export class EpssScore extends ValueObject {
  private constructor(
    public readonly probability: number,
    public readonly percentile: number,
  ) {
    super();
    Object.freeze(this);
  }

  public static create(probability: number, percentile: number): EpssScore {
    return new EpssScore(
      parse(probabilitySchema, probability, 'EPSS probability'),
      parse(probabilitySchema, percentile, 'EPSS percentile'),
    );
  }

  /** Probability expressed as a percentage in [0, 100]. */
  public get probabilityPercent(): number {
    return this.probability * 100;
  }
}
