// Mock data for the findings worklist. Mirrors the backend domain shapes
// (Finding = a vulnerability detected on an asset by a source, with status +
// severity + risk score). Replaced by the REST API once the backend serves it.

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

export const findings: Finding[] = [
  {
    id: "f-1001",
    title: "Apache Log4j2 remote code execution (Log4Shell)",
    severity: "CRITICAL",
    status: "OPEN",
    riskScore: 98,
    asset: { name: "payments-api", type: "CODE_REPOSITORY" },
    vulnerability: { id: "CVE-2021-44228", cve: "CVE-2021-44228" },
    source: "Checkmarx SCA",
    sourceType: "SCA",
    cwe: 502,
    epss: 0.975,
    knownExploited: true,
    firstSeen: "2026-06-18",
    lastSeen: "2026-07-02",
  },
  {
    id: "f-1002",
    title: "Spring Framework RCE (Spring4Shell)",
    severity: "CRITICAL",
    status: "CONFIRMED",
    riskScore: 94,
    asset: { name: "checkout-service", type: "CONTAINER" },
    vulnerability: { id: "CVE-2022-22965", cve: "CVE-2022-22965" },
    source: "Trivy",
    sourceType: "CONTAINER_SCANNER",
    cwe: 94,
    epss: 0.94,
    knownExploited: true,
    firstSeen: "2026-06-20",
    lastSeen: "2026-07-02",
  },
  {
    id: "f-1003",
    title: "SQL injection in order lookup",
    severity: "HIGH",
    status: "OPEN",
    riskScore: 82,
    asset: { name: "payments-api", type: "CODE_REPOSITORY" },
    vulnerability: { id: "cxsast:query:589" },
    source: "Checkmarx SAST",
    sourceType: "SAST",
    cwe: 89,
    knownExploited: false,
    firstSeen: "2026-06-28",
    lastSeen: "2026-07-02",
  },
  {
    id: "f-1004",
    title: "OpenSSL infinite loop (DoS)",
    severity: "HIGH",
    status: "OPEN",
    riskScore: 74,
    asset: { name: "edge-gateway-01", type: "HOST" },
    vulnerability: { id: "CVE-2022-0778", cve: "CVE-2022-0778" },
    source: "Tenable Nessus",
    sourceType: "NETWORK_SCANNER",
    epss: 0.61,
    knownExploited: false,
    firstSeen: "2026-05-30",
    lastSeen: "2026-07-01",
  },
  {
    id: "f-1005",
    title: "Reflected XSS in search parameter",
    severity: "MEDIUM",
    status: "CONFIRMED",
    riskScore: 58,
    asset: { name: "www.acme.example", type: "WEB_APPLICATION" },
    vulnerability: { id: "cxsast:query:12" },
    source: "Checkmarx SAST",
    sourceType: "SAST",
    cwe: 79,
    knownExploited: false,
    firstSeen: "2026-06-25",
    lastSeen: "2026-07-02",
  },
  {
    id: "f-1006",
    title: "S3 bucket publicly readable",
    severity: "HIGH",
    status: "RISK_ACCEPTED",
    riskScore: 66,
    asset: { name: "arn:aws:s3:::acme-public-assets", type: "CLOUD_RESOURCE" },
    vulnerability: { id: "cspm:s3-public-read" },
    source: "Prowler",
    sourceType: "CSPM",
    knownExploited: false,
    firstSeen: "2026-04-11",
    lastSeen: "2026-07-02",
  },
  {
    id: "f-1007",
    title: "Outdated lodash prototype pollution",
    severity: "MEDIUM",
    status: "OPEN",
    riskScore: 44,
    asset: { name: "web-frontend", type: "CODE_REPOSITORY" },
    vulnerability: { id: "CVE-2019-10744", cve: "CVE-2019-10744" },
    source: "Checkmarx SCA",
    sourceType: "SCA",
    cwe: 1321,
    epss: 0.12,
    knownExploited: false,
    firstSeen: "2026-06-15",
    lastSeen: "2026-07-02",
  },
  {
    id: "f-1008",
    title: "TLS 1.0/1.1 enabled",
    severity: "LOW",
    status: "OPEN",
    riskScore: 22,
    asset: { name: "edge-gateway-01", type: "HOST" },
    vulnerability: { id: "nessus:104743" },
    source: "Tenable Nessus",
    sourceType: "NETWORK_SCANNER",
    knownExploited: false,
    firstSeen: "2026-05-30",
    lastSeen: "2026-07-01",
  },
  {
    id: "f-1009",
    title: "Missing HTTP security headers",
    severity: "LOW",
    status: "MITIGATED",
    riskScore: 15,
    asset: { name: "www.acme.example", type: "WEB_APPLICATION" },
    vulnerability: { id: "zap:10038" },
    source: "OWASP ZAP",
    sourceType: "DAST",
    knownExploited: false,
    firstSeen: "2026-06-01",
    lastSeen: "2026-06-29",
  },
  {
    id: "f-1010",
    title: "Container runs as root",
    severity: "MEDIUM",
    status: "OPEN",
    riskScore: 39,
    asset: { name: "checkout-service", type: "CONTAINER" },
    vulnerability: { id: "trivy:DS002" },
    source: "Trivy",
    sourceType: "CONTAINER_SCANNER",
    knownExploited: false,
    firstSeen: "2026-06-20",
    lastSeen: "2026-07-02",
  },
];
