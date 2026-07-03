import { ASSET_CRITICALITY_WEIGHT } from '../enums/asset-criticality';
import { ConfidenceLevel } from '../enums/confidence-level';
import { RiskScore } from '../value-objects/risk-score';
import { RiskScoringInput, RiskScoringStrategy } from './risk-scoring-strategy';

export interface RiskScoringWeights {
  /** Weight of intrinsic threat (severity / CVSS). */
  readonly threat: number;
  /** Weight of exploitability (EPSS / known-exploited). */
  readonly exploit: number;
  /** Weight of exposure (asset criticality). */
  readonly exposure: number;
}

const DEFAULT_WEIGHTS: RiskScoringWeights = { threat: 0.45, exploit: 0.3, exposure: 0.25 };

const CONFIDENCE_FACTOR: Readonly<Record<ConfidenceLevel, number>> = {
  [ConfidenceLevel.Certain]: 1.0,
  [ConfidenceLevel.Firm]: 0.85,
  [ConfidenceLevel.Tentative]: 0.6,
};

/**
 * A transparent, reference risk-scoring strategy on a 0–100 scale. It is a
 * deliberately simple, explainable blend — NOT an authoritative model. It exists
 * so the platform has sane out-of-the-box behaviour; deployments are expected to
 * inject their own {@link RiskScoringStrategy} (SSVC, vendor scores, ML, …).
 *
 *   threat   = max(severityWeight, cvss/10)
 *   exploit  = knownExploited ? 1 : epss.probability
 *   exposure = assetCriticalityWeight
 *   raw      = wThreat·threat + wExploit·exploit + wExposure·exposure
 *   score    = 100 · raw · confidenceFactor
 */
export class DefaultRiskScoringStrategy implements RiskScoringStrategy {
  private readonly weights: RiskScoringWeights;

  public constructor(weights: RiskScoringWeights = DEFAULT_WEIGHTS) {
    this.weights = weights;
  }

  public score(input: RiskScoringInput): RiskScore {
    const severityWeight = input.severity.rank / 4; // rank 0..4 → 0..1
    const cvssWeight = input.cvssScore ? input.cvssScore.value / 10 : 0;
    const threat = Math.max(severityWeight, cvssWeight);

    const exploit = input.knownExploited ? 1 : (input.epss?.probability ?? 0);
    const exposure = ASSET_CRITICALITY_WEIGHT[input.assetCriticality];

    const raw = this.weights.threat * threat + this.weights.exploit * exploit + this.weights.exposure * exposure;
    const confidence = input.confidence ? CONFIDENCE_FACTOR[input.confidence] : 0.8;

    const value = Math.min(100, Math.max(0, 100 * raw * confidence));
    return RiskScore.of(value);
  }
}
