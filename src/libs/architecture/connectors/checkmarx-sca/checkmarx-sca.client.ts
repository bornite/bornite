import { CheckmarxScaConfig } from './checkmarx-sca.config';
import {
  CheckmarxPackage,
  CheckmarxProject,
  CheckmarxScan,
  CheckmarxVulnerability,
} from './checkmarx-sca.types';

const TOKEN_PATH = '/identity/connect/token';
const SCOPE = 'sca_api access_control_api';
const CLIENT_ID = 'sca_resource_owner';

interface TokenResponse {
  access_token: string;
  expires_in?: number;
}

/**
 * REST client for Checkmarx SCA, modelled on the Checkmarx Python SDK.
 *
 * Auth: OAuth2 password grant against `{accessControlUrl}/identity/connect/token`
 * with `client_id=sca_resource_owner` and the tenant in `acr_values`. Data calls
 * hit `{apiUrl}/risk-management/*` with a bearer token, which is cached and
 * refreshed on expiry.
 */
export class CheckmarxScaClient {
  private token: string | null = null;
  private tokenExpiresAt = 0;

  public constructor(private readonly config: CheckmarxScaConfig) {}

  public async authenticate(): Promise<void> {
    const body = new URLSearchParams({
      username: this.config.username,
      password: this.config.password,
      acr_values: `Tenant:${this.config.tenant}`,
      grant_type: 'password',
      scope: SCOPE,
      client_id: CLIENT_ID,
    });
    const response = await fetch(`${this.config.accessControlUrl}${TOKEN_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) {
      throw new Error(`Checkmarx SCA authentication failed: ${response.status} ${response.statusText}`);
    }
    const json = (await response.json()) as TokenResponse;
    this.token = json.access_token;
    // Refresh a minute early to avoid mid-request expiry.
    this.tokenExpiresAt = Date.now() + ((json.expires_in ?? 3600) - 60) * 1000;
  }

  public listProjects(): Promise<CheckmarxProject[]> {
    return this.get<CheckmarxProject[]>('/risk-management/projects');
  }

  public listScans(projectId: string): Promise<CheckmarxScan[]> {
    return this.get<CheckmarxScan[]>(`/risk-management/scans?projectId=${encodeURIComponent(projectId)}`);
  }

  public async latestScan(projectId: string): Promise<CheckmarxScan | null> {
    const scans = await this.listScans(projectId);
    if (scans.length === 0) {
      return null;
    }
    const sorted = [...scans].sort((a, b) => a.createdOn.localeCompare(b.createdOn));
    return sorted[sorted.length - 1];
  }

  public listVulnerabilities(reportId: string): Promise<CheckmarxVulnerability[]> {
    return this.get<CheckmarxVulnerability[]>(
      `/risk-management/risk-reports/${encodeURIComponent(reportId)}/vulnerabilities`,
    );
  }

  public listPackages(reportId: string): Promise<CheckmarxPackage[]> {
    return this.get<CheckmarxPackage[]>(
      `/risk-management/risk-reports/${encodeURIComponent(reportId)}/packages`,
    );
  }

  private async get<T>(path: string): Promise<T> {
    await this.ensureToken();
    const response = await fetch(`${this.config.apiUrl}${path}`, {
      headers: { Authorization: `Bearer ${this.token ?? ''}`, Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Checkmarx SCA request failed (${response.status} ${response.statusText}): ${path}`);
    }
    return (await response.json()) as T;
  }

  private async ensureToken(): Promise<void> {
    if (this.token === null || Date.now() >= this.tokenExpiresAt) {
      await this.authenticate();
    }
  }
}
