/**
 * How confident the source is that a finding is a true positive. Maps the numeric
 * scanner-confidence buckets many tools emit (≤2 Certain, 3–5 Firm, else Tentative)
 * onto a small, explicit vocabulary.
 */
export enum ConfidenceLevel {
  /** Confirmed / certain — little chance of being a false positive. */
  Certain = 'CERTAIN',
  /** Firm — probably a true positive. */
  Firm = 'FIRM',
  /** Tentative — needs manual verification. */
  Tentative = 'TENTATIVE',
}
