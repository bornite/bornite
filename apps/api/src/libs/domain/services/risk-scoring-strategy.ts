import { AssetCriticality } from '../enums/asset-criticality';
import { ConfidenceLevel } from '../enums/confidence-level';
import { CvssScore } from '../value-objects/cvss-score';
import { EpssScore } from '../value-objects/epss-score';
import { RiskScore } from '../value-objects/risk-score';
import { Severity } from '../value-objects/severity';

/**
 * Everything a strategy needs to score one finding's risk. Split into the part
 * the {@link Finding} contributes about itself (severity, confidence) and the
 * external factors the application assembles from the vulnerability catalog and
 * the asset (see {@link RiskScoringContext}).
 */
export interface RiskScoringInput {
  readonly severity: Severity;
  readonly confidence: ConfidenceLevel | null;
  readonly epss: EpssScore | null;
  readonly cvssScore: CvssScore | null;
  readonly knownExploited: boolean;
  readonly assetCriticality: AssetCriticality;
}

/**
 * The externally-sourced half of {@link RiskScoringInput} — the factors that live
 * on *other* aggregates (the {@link VulnerabilityDefinition} and the {@link Asset})
 * and must be supplied when asking a finding to (re)score itself.
 */
export type RiskScoringContext = Omit<RiskScoringInput, 'severity' | 'confidence'>;

/**
 * Port for computing a finding's {@link RiskScore}. THE risk-scoring seam: the
 * domain never hardcodes a formula — an implementation is injected. Swap in an
 * SSVC model, a vendor score, or a bespoke blend without touching the entities.
 */
export interface RiskScoringStrategy {
  score(input: RiskScoringInput): RiskScore;
}
