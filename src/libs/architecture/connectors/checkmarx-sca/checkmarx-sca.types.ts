/**
 * Minimal shapes of the Checkmarx SCA REST responses we consume, named after the
 * fields the API actually returns (per the Checkmarx Python SDK).
 */

export interface CheckmarxProject {
  id: string;
  name: string;
  branch?: string;
  lastSuccessfulScanId?: string;
}

export interface CheckmarxScanStatus {
  name: string;
  message?: string;
}

export interface CheckmarxScan {
  scanId: string;
  /** Same UUID as scanId; usable directly as the risk-report id. */
  riskReportId: string;
  projectId: string;
  createdOn: string;
  status?: CheckmarxScanStatus;
}

/** Checkmarx returns CVSS as a structured object, not a single vector string. */
export interface CheckmarxCvss {
  version?: number;
  attackVector?: string;
  attackComplexity?: string;
  confidentiality?: string;
  availability?: string;
  integrityImpact?: string;
  authentication?: string | null;
}

export interface CheckmarxVulnerability {
  id: string;
  /** CVE id, or empty string when the vuln has no CVE. */
  cveName: string;
  /** CVSS base score. */
  score: number;
  severity: string;
  description?: string;
  cwe?: string;
  publishDate?: string;
  /** Join key into the packages list. */
  packageId: string;
  fixResolutionText?: string;
  references?: string[];
  cvss?: CheckmarxCvss;
}

export interface CheckmarxPackage {
  id: string;
  name: string;
  version: string;
}
