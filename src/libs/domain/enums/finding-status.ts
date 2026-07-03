/**
 * Primary lifecycle state of a {@link Finding}.
 *
 * Legacy VM tools model finding state as a bag of overlapping booleans
 * (active, verified, false-positive, duplicate, out-of-scope, risk-accepted,
 * mitigated, under-review). We collapse that into a single, explicit
 * lifecycle enum — the source of truth for "what state is this finding in" — and
 * derive the notion of "active/open" from it (see {@link ACTIVE_STATUSES}).
 *
 * Orthogonal concerns that genuinely co-exist with the lifecycle (e.g. "is this
 * currently under review") are kept as separate flags on the entity rather than
 * folded in here.
 */
export enum FindingStatus {
  /** Newly detected, not yet triaged. Counts as active/open. */
  Open = 'OPEN',
  /** Triaged and confirmed a true positive by a human. Counts as active/open. */
  Confirmed = 'CONFIRMED',
  /** Judged a false positive. Terminal-ish; can be reopened. */
  FalsePositive = 'FALSE_POSITIVE',
  /** Outside the agreed scope of the assessment; excluded from metrics. */
  OutOfScope = 'OUT_OF_SCOPE',
  /** A duplicate of another finding (see `duplicateOfId`). */
  Duplicate = 'DUPLICATE',
  /** Risk formally accepted via a {@link RiskAcceptance}. Not active. */
  RiskAccepted = 'RISK_ACCEPTED',
  /** Remediation applied / fix deployed. Not active. */
  Mitigated = 'MITIGATED',
  /** No longer observed by any source; closed. Not active. */
  Resolved = 'RESOLVED',
}

/** Statuses that count as an open, security-relevant exposure. */
export const ACTIVE_STATUSES: readonly FindingStatus[] = [
  FindingStatus.Open,
  FindingStatus.Confirmed,
];
