import { EnrichmentProvider, VulnerabilityEnrichment } from '../../application';

const DEFAULT_URL =
  'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';

interface KevCatalog {
  vulnerabilities?: Array<{ cveID: string; dateAdded: string }>;
}

/**
 * CISA KEV provider. Fetches the Known Exploited Vulnerabilities catalog once
 * (cached for the instance's lifetime) and flags any requested CVE that appears
 * in it — the strongest "this is being exploited in the wild" signal.
 */
export class KevEnrichmentProvider implements EnrichmentProvider {
  public readonly key = 'cisa-kev';
  private catalog: Map<string, Date> | null = null;

  public constructor(private readonly catalogUrl: string = DEFAULT_URL) {}

  public async enrich(cves: readonly string[]): Promise<VulnerabilityEnrichment[]> {
    const catalog = await this.loadCatalog();
    const out: VulnerabilityEnrichment[] = [];
    for (const cve of cves) {
      const dateAdded = catalog.get(cve.toUpperCase());
      if (dateAdded !== undefined) {
        out.push({ cve, knownExploited: true, kevDate: dateAdded });
      }
    }
    return out;
  }

  private async loadCatalog(): Promise<Map<string, Date>> {
    if (this.catalog !== null) {
      return this.catalog;
    }
    const response = await fetch(this.catalogUrl, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      throw new Error(`CISA KEV request failed: ${response.status} ${response.statusText}`);
    }
    const json = (await response.json()) as KevCatalog;
    const catalog = new Map<string, Date>();
    for (const entry of json.vulnerabilities ?? []) {
      catalog.set(entry.cveID.toUpperCase(), new Date(entry.dateAdded));
    }
    this.catalog = catalog;
    return catalog;
  }
}
