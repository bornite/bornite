/**
 * Qualitative severity band of a vulnerability, aligned with the CVSS
 * qualitative severity rating scale (plus an explicit `Info` bucket used by many
 * scanners for advisory findings).
 *
 * Ordered numerically so callers can compare bands without a lookup table.
 * Higher number = more severe. The numeric value is an internal ranking, not a
 * CVSS score.
 */
export enum SeverityLevel {
  Info = 'INFO',
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Critical = 'CRITICAL',
}

/** Rank used for ordering/comparison. Higher = more severe. */
export const SEVERITY_RANK: Readonly<Record<SeverityLevel, number>> = {
  [SeverityLevel.Info]: 0,
  [SeverityLevel.Low]: 1,
  [SeverityLevel.Medium]: 2,
  [SeverityLevel.High]: 3,
  [SeverityLevel.Critical]: 4,
};

/** All levels ordered from least to most severe. */
export const SEVERITY_ORDER: readonly SeverityLevel[] = [
  SeverityLevel.Info,
  SeverityLevel.Low,
  SeverityLevel.Medium,
  SeverityLevel.High,
  SeverityLevel.Critical,
];
