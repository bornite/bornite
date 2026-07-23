import type { Asset, PriorityEvaluationContext, VulnerabilityDefinition } from '../../domain';

/**
 * Assemble the externally-sourced half of a finding's priority facts from its
 * {@link VulnerabilityDefinition} and {@link Asset}. The finding contributes its
 * own facts (severity, status, risk score) inside {@link Finding.applyPriority};
 * this is the shared builder used both at ingestion and during re-evaluation, so
 * the two paths always feed the rule engine the exact same context shape.
 */
export function buildPriorityEvaluationContext(
  definition: VulnerabilityDefinition,
  asset: Asset,
): PriorityEvaluationContext {
  return {
    cvssBaseScore: definition.cvss?.baseScore ?? null,
    epssProbability: definition.epss?.probability ?? null,
    epssPercentile: definition.epss?.percentile ?? null,
    knownExploited: definition.knownExploited,
    ransomware: definition.ransomwareUsed,
    fixAvailable: definition.fixAvailable,
    cve: definition.cve(),
    cwes: definition.cweNumbers(),
    assetType: asset.type,
    assetCriticality: asset.criticality,
    assetTags: asset.tags,
  };
}
