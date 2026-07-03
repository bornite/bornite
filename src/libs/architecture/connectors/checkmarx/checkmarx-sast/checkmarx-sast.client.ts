import { XMLParser } from 'fast-xml-parser';
import { CheckmarxSastConfig } from './checkmarx-sast.config';
import {
  CxSastFinding,
  CxSastProject,
  CxSastReportRegistration,
  CxSastReportStatus,
  CxSastScan,
} from './checkmarx-sast.types';

const TOKEN_PATH = '/auth/identity/connect/token';
const SCOPE = 'sast_rest_api access_control_api';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30;

interface TokenResponse {
  access_token: string;
  expires_in?: number;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

// --- XML report shapes (attributes only; parseAttributeValue is off) ---
interface XmlPath {
  SimilarityId?: string;
}
interface XmlResult {
  FileName?: string;
  Line?: string;
  Severity?: string;
  Path?: XmlPath | XmlPath[];
}
interface XmlQuery {
  id?: string;
  name?: string;
  cweId?: string;
  group?: string;
  Severity?: string;
  Result?: XmlResult | XmlResult[];
}
interface XmlReport {
  CxXMLResults?: { Query?: XmlQuery | XmlQuery[] };
}

/**
 * Parse a CxSAST XML scan report into flattened findings. `SimilarityId` lives on
 * the `<Path>` node under each `<Result>`, so we descend into it — that id is
 * stable across scans and drives deduplication.
 */
export function parseCxSastReport(xml: string): CxSastFinding[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', parseAttributeValue: false });
  const document = parser.parse(xml) as XmlReport;
  const findings: CxSastFinding[] = [];

  for (const query of toArray(document.CxXMLResults?.Query)) {
    const cweRaw = query.cweId === undefined || query.cweId === '' ? null : Number(query.cweId);
    const cweId = cweRaw !== null && Number.isInteger(cweRaw) && cweRaw > 0 ? cweRaw : null;
    for (const result of toArray(query.Result)) {
      const lineRaw = result.Line === undefined || result.Line === '' ? null : Number(result.Line);
      findings.push({
        queryId: query.id ?? '',
        queryName: query.name ?? '',
        cweId,
        group: query.group ?? null,
        severity: result.Severity ?? query.Severity ?? 'Info',
        fileName: result.FileName ?? '',
        line: lineRaw !== null && Number.isFinite(lineRaw) ? lineRaw : null,
        similarityId: toArray(result.Path)[0]?.SimilarityId ?? '',
      });
    }
  }
  return findings;
}

/**
 * REST client for classic CxSAST, modelled on the Checkmarx Python SDK.
 *
 * Auth: OAuth2 password grant against `{baseUrl}/cxrestapi/auth/identity/connect/token`.
 * Detailed results use the report flow: register an XML report, poll until it is
 * `Created`, download and parse it.
 */
export class CheckmarxSastClient {
  private token: string | null = null;
  private tokenExpiresAt = 0;
  private readonly apiUrl: string;

  public constructor(private readonly config: CheckmarxSastConfig) {
    this.apiUrl = `${config.baseUrl.replace(/\/+$/, '')}/cxrestapi`;
  }

  public async authenticate(): Promise<void> {
    const body = new URLSearchParams({
      username: this.config.username,
      password: this.config.password,
      grant_type: 'password',
      scope: SCOPE,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });
    const response = await fetch(`${this.apiUrl}${TOKEN_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) {
      throw new Error(`Checkmarx SAST authentication failed: ${response.status} ${response.statusText}`);
    }
    const json = (await response.json()) as TokenResponse;
    this.token = json.access_token;
    this.tokenExpiresAt = Date.now() + ((json.expires_in ?? 3600) - 60) * 1000;
  }

  public listProjects(): Promise<CxSastProject[]> {
    return this.get<CxSastProject[]>('/projects');
  }

  public async lastFinishedScan(projectId: number): Promise<CxSastScan | null> {
    const scans = await this.get<CxSastScan[]>(
      `/sast/scans?projectId=${projectId}&scanStatus=Finished&last=1`,
    );
    return scans.length > 0 ? scans[0] : null;
  }

  public async getResults(scanId: number): Promise<CxSastFinding[]> {
    const registration = await this.post<CxSastReportRegistration>('/reports/sastScan', {
      reportType: 'XML',
      scanId,
    });
    await this.waitForReport(registration.reportId);
    const xml = await this.getText(`/reports/sastScan/${registration.reportId}`);
    return parseCxSastReport(xml);
  }

  private async waitForReport(reportId: number): Promise<void> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      const status = await this.get<CxSastReportStatus>(`/reports/sastScan/${reportId}/status`);
      if (status.status.value === 'Created') {
        return;
      }
      if (status.status.value === 'Failed') {
        throw new Error('Checkmarx SAST report generation failed.');
      }
      await sleep(POLL_INTERVAL_MS);
    }
    throw new Error(`Timed out waiting for Checkmarx SAST report ${reportId}.`);
  }

  private async get<T>(path: string): Promise<T> {
    const response = await this.request(path, { method: 'GET', accept: 'application/json' });
    return (await response.json()) as T;
  }

  private async getText(path: string): Promise<string> {
    const response = await this.request(path, { method: 'GET', accept: 'application/xml' });
    return response.text();
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const response = await this.request(path, { method: 'POST', accept: 'application/json', body });
    return (await response.json()) as T;
  }

  private async request(
    path: string,
    options: { method: string; accept: string; body?: Record<string, unknown> },
  ): Promise<Response> {
    await this.ensureToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token ?? ''}`,
      Accept: options.accept,
    };
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${this.apiUrl}${path}`, {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    if (!response.ok) {
      throw new Error(`Checkmarx SAST request failed (${response.status} ${response.statusText}): ${path}`);
    }
    return response;
  }

  private async ensureToken(): Promise<void> {
    if (this.token === null || Date.now() >= this.tokenExpiresAt) {
      await this.authenticate();
    }
  }
}
