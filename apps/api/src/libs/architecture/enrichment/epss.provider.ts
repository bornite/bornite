import { EnrichmentProvider, VulnerabilityEnrichment } from '../../application';

const DEFAULT_URL = 'https://api.first.org/data/v1/epss';
const CHUNK_SIZE = 100;

interface EpssResponse {
  data?: Array<{ cve: string; epss: string; percentile: string }>;
}

/**
 * EPSS provider (FIRST.org). Batches CVEs into the `?cve=` query and returns the
 * exploit-prediction probability + percentile for each — the key exploitability
 * signal for risk scoring.
 */
export class EpssEnrichmentProvider implements EnrichmentProvider {
  public readonly key = 'epss';

  public constructor(private readonly baseUrl: string = DEFAULT_URL) {}

  public async enrich(cves: readonly string[]): Promise<VulnerabilityEnrichment[]> {
    const out: VulnerabilityEnrichment[] = [];
    for (let i = 0; i < cves.length; i += CHUNK_SIZE) {
      const chunk = cves.slice(i, i + CHUNK_SIZE);
      const url = `${this.baseUrl}?cve=${chunk.map(encodeURIComponent).join(',')}`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        throw new Error(`EPSS request failed: ${response.status} ${response.statusText}`);
      }
      const json = (await response.json()) as EpssResponse;
      for (const row of json.data ?? []) {
        out.push({
          cve: row.cve,
          epss: { probability: Number(row.epss), percentile: Number(row.percentile) },
        });
      }
    }
    return out;
  }
}
