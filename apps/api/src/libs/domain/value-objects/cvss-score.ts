import { z } from 'zod';
import { SeverityLevel } from '../enums/severity-level';
import { parse } from '../shared/parse';
import { ValueObject } from '../shared/value-object';
import { Severity } from './severity';

const schema = z.number().min(0).max(10);

/** A CVSS numeric base score in the range 0.0–10.0. */
export class CvssScore extends ValueObject {
  private constructor(public readonly value: number) {
    super();
    Object.freeze(this);
  }

  public static of(value: number): CvssScore {
    const parsed = parse(schema, value, 'CVSS score');
    // Normalise to one decimal place, the CVSS convention.
    return new CvssScore(Math.round(parsed * 10) / 10);
  }

  public toSeverity(): Severity {
    return Severity.fromCvssScore(this.value);
  }

  public toSeverityLevel(): SeverityLevel {
    return this.toSeverity().level;
  }
}
