import {
  CvssVector,
  EpssScore,
  VulnerabilityDefinitionRepository,
  VulnerabilityIdentifier,
  VulnerabilitySystem,
} from '../../domain';
import { Clock } from '../ports/clock';
import { EnrichmentProvider, VulnerabilityEnrichment } from './enrichment-provider';

export interface EnrichCatalogResult {
  readonly requested: number;
  readonly enriched: number;
  readonly updated: number;
}

/**
 * Enrich the vulnerability catalog for a set of CVEs: gather intelligence from
 * all providers, merge it, and apply it to the matching
 * {@link VulnerabilityDefinition}s (EPSS, KEV/exploit flag, CVSS). A provider
 * that fails is skipped, not fatal — partial intelligence still lands.
 */
export class EnrichCatalog {
  public constructor(
    private readonly providers: readonly EnrichmentProvider[],
    private readonly definitions: VulnerabilityDefinitionRepository,
    private readonly clock: Clock,
  ) {}

  public async execute(cves: readonly string[]): Promise<EnrichCatalogResult> {
    const now = this.clock.now();
    const merged = new Map<string, VulnerabilityEnrichment>();

    for (const provider of this.providers) {
      let results: VulnerabilityEnrichment[];
      try {
        results = await provider.enrich(cves);
      } catch {
        continue;
      }
      for (const result of results) {
        const key = result.cve.toUpperCase();
        merged.set(key, { ...merged.get(key), ...result, cve: key });
      }
    }

    let updated = 0;
    for (const [cve, enrichment] of merged) {
      const definition = await this.definitions.findByIdentifier(
        VulnerabilityIdentifier.create(VulnerabilitySystem.Cve, cve),
      );
      if (definition === null) {
        continue;
      }
      if (enrichment.epss) {
        definition.updateEpss(
          EpssScore.create(enrichment.epss.probability, enrichment.epss.percentile),
          now,
        );
      }
      if (enrichment.knownExploited) {
        definition.markKnownExploited(enrichment.kevDate ?? now, now);
      }
      if (enrichment.cvssVector) {
        definition.updateCvss(CvssVector.create(enrichment.cvssVector, enrichment.cvssScore), now);
      }
      await this.definitions.save(definition);
      updated += 1;
    }

    return { requested: cves.length, enriched: merged.size, updated };
  }
}
