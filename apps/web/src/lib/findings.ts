// Finding types shared across the worklist UI. Shapes match the API's
// FindingListItemDto (GET /findings). Data now comes from the API — see lib/api.

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type FindingStatus =
  | "OPEN"
  | "CONFIRMED"
  | "RISK_ACCEPTED"
  | "MITIGATED"
  | "RESOLVED"
  | "FALSE_POSITIVE";

export type RiskBand = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "MINIMAL";

export type AssetType =
  | "HOST"
  | "WEB_APPLICATION"
  | "CONTAINER"
  | "CODE_REPOSITORY"
  | "CLOUD_RESOURCE";

export type SourceType =
  | "NETWORK_SCANNER"
  | "SAST"
  | "DAST"
  | "SCA"
  | "CSPM"
  | "CONTAINER_SCANNER";

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  status: FindingStatus;
  riskScore: number;
  asset: { name: string; type: AssetType };
  vulnerability: { id: string; cve?: string };
  source: string;
  sourceType: SourceType;
  cwe?: number;
  epss?: number;
  knownExploited: boolean;
  firstSeen: string;
  lastSeen: string;
}

export function riskBand(score: number): RiskBand {
  if (score >= 90) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  if (score >= 10) return "LOW";
  return "MINIMAL";
}
