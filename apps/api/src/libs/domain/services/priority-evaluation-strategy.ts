import type { AssetCriticality } from '../enums/asset-criticality';
import type { AssetType } from '../enums/asset-type';
import type { PriorityScheme } from '../entities/priority-scheme';
import type { FindingFacts } from '../value-objects/finding-facts';

/**
 * The externally-sourced facts a finding needs to evaluate its priority — the half
 * that lives on *other* aggregates (the {@link VulnerabilityDefinition} and the
 * {@link Asset}) and must be supplied when asking a finding to (re)prioritise
 * itself. The finding contributes its own facts (severity, status, confidence, risk
 * score) internally; mirrors {@link RiskScoringContext}.
 */
export interface PriorityEvaluationContext {
  readonly cvssBaseScore: number | null;
  readonly epssProbability: number | null;
  readonly epssPercentile: number | null;
  readonly knownExploited: boolean;
  readonly ransomware: boolean;
  readonly fixAvailable: boolean | null;
  readonly cve: string | null;
  readonly cwes: readonly number[];
  readonly assetType: AssetType;
  readonly assetCriticality: AssetCriticality;
  readonly assetTags: readonly string[];
}

/** The decision a strategy returns: which level, its rank, and the rule that fired. */
export interface PriorityDecision {
  readonly levelKey: string;
  readonly rank: number;
  /** The id of the rule that matched, or null when the default level was used. */
  readonly matchedRuleId: string | null;
}

/**
 * Port for turning a {@link PriorityScheme} + a finding's facts into a
 * {@link PriorityDecision}. THE priority seam, mirroring the risk-scoring seam: the
 * domain never hardcodes the matching semantics — an implementation is injected, so
 * "first match wins" can be swapped for "most urgent wins" or a per-scheme choice
 * without touching the aggregate or the finding.
 */
export interface PriorityEvaluationStrategy {
  evaluate(scheme: PriorityScheme, facts: FindingFacts): PriorityDecision;
}
