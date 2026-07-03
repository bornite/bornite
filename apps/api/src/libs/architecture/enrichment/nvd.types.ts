/** Minimal shapes of the NVD API 2.0 CVE response we consume. */

export interface NvdCvssData {
  vectorString?: string;
  baseScore?: number;
}

export interface NvdCvssMetric {
  cvssData?: NvdCvssData;
}

export interface NvdWeakness {
  description?: Array<{ lang?: string; value?: string }>;
}

export interface NvdCve {
  id?: string;
  published?: string;
  metrics?: {
    cvssMetricV31?: NvdCvssMetric[];
    cvssMetricV30?: NvdCvssMetric[];
  };
  weaknesses?: NvdWeakness[];
  references?: Array<{ url?: string }>;
}

export interface NvdResponse {
  vulnerabilities?: Array<{ cve?: NvdCve }>;
}
