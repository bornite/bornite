/**
 * Read model (query projection) for the findings worklist — a denormalized,
 * UI-shaped view, deliberately decoupled from the write-side aggregates and
 * their domain enums. This is what queries return and what the HTTP DTO mirrors.
 */

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type FindingStatus =
  | 'OPEN'
  | 'CONFIRMED'
  | 'RISK_ACCEPTED'
  | 'MITIGATED'
  | 'RESOLVED'
  | 'FALSE_POSITIVE';

export type AssetType =
  | 'HOST'
  | 'WEB_APPLICATION'
  | 'CONTAINER'
  | 'CODE_REPOSITORY'
  | 'CLOUD_RESOURCE';

export type SourceType =
  | 'NETWORK_SCANNER'
  | 'SAST'
  | 'DAST'
  | 'SCA'
  | 'CSPM'
  | 'CONTAINER_SCANNER';

export interface FindingListItem {
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
