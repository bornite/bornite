/**
 * Enrichment data a provider can supply for a single CVE. Every field is
 * optional — each provider fills only what it knows (EPSS fills `epss`, CISA KEV
 * fills `knownExploited`/`kevDate`, NVD fills `cvss*`/`cwes`/`references`).
 */
export interface VulnerabilityEnrichment {
  readonly cve: string;
  readonly epss?: { readonly probability: number; readonly percentile: number };
  readonly knownExploited?: boolean;
  readonly kevDate?: Date;
  readonly cvssVector?: string;
  readonly cvssScore?: number;
  readonly cwes?: readonly number[];
  readonly references?: readonly string[];
  readonly publishedAt?: Date;
}

/**
 * A vulnerability-intelligence feed (EPSS, CISA KEV, NVD, …). The Hackuity-style
 * "vulnerability intelligence" side of the platform: it enriches the
 * {@link VulnerabilityDefinition} catalog out-of-band, independently of the
 * assessment connectors that discover findings. Implementations live in the
 * infrastructure layer.
 */
export interface EnrichmentProvider {
  readonly key: string;
  enrich(cves: readonly string[]): Promise<VulnerabilityEnrichment[]>;
}
