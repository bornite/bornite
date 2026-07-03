import { EnrichmentProvider, VulnerabilityEnrichment } from '../../application';
import { NvdCve, NvdResponse } from './nvd.types';

const DEFAULT_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export interface NvdOptions {
  apiKey?: string;
  baseUrl?: string;
}

/**
 * NVD (National Vulnerability Database) provider. One request per CVE for the
 * CVSS vector/score, CWEs and references. NVD rate-limits aggressively, so
 * requests are spaced out (tighter with an API key).
 */
export class NvdEnrichmentProvider implements EnrichmentProvider {
  public readonly key = 'nvd';
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly delayMs: number;

  public constructor(options: NvdOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_URL;
    // Public limit is ~5 requests / 30s; ~50 / 30s with a key.
    this.delayMs = this.apiKey === undefined ? 6500 : 700;
  }

  public async enrich(cves: readonly string[]): Promise<VulnerabilityEnrichment[]> {
    const out: VulnerabilityEnrichment[] = [];
    for (let i = 0; i < cves.length; i += 1) {
      const cve = cves[i];
      const response = await fetch(`${this.baseUrl}?cveId=${encodeURIComponent(cve)}`, {
        headers: this.headers(),
      });
      if (response.status === 404) {
        continue;
      }
      if (!response.ok) {
        throw new Error(`NVD request failed: ${response.status} ${response.statusText}`);
      }
      const json = (await response.json()) as NvdResponse;
      const cveData = json.vulnerabilities?.[0]?.cve;
      if (cveData !== undefined) {
        out.push(this.toEnrichment(cve, cveData));
      }
      if (i < cves.length - 1) {
        await sleep(this.delayMs);
      }
    }
    return out;
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.apiKey !== undefined) {
      headers.apiKey = this.apiKey;
    }
    return headers;
  }

  private toEnrichment(cve: string, data: NvdCve): VulnerabilityEnrichment {
    const cvss = data.metrics?.cvssMetricV31?.[0]?.cvssData ?? data.metrics?.cvssMetricV30?.[0]?.cvssData;
    const cwes = (data.weaknesses ?? [])
      .flatMap((weakness) => (weakness.description ?? []).map((d) => d.value))
      .filter((value): value is string => typeof value === 'string' && /^CWE-\d+$/.test(value))
      .map((value) => Number(value.slice(4)));
    const references = (data.references ?? [])
      .map((reference) => reference.url)
      .filter((url): url is string => typeof url === 'string');

    return {
      cve,
      cvssVector: cvss?.vectorString,
      cvssScore: cvss?.baseScore,
      cwes: cwes.length > 0 ? cwes : undefined,
      references: references.length > 0 ? references : undefined,
      publishedAt: data.published === undefined ? undefined : new Date(data.published),
    };
  }
}
