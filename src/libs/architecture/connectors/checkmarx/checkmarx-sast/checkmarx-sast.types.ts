/**
 * Shapes for the classic CxSAST REST API and its XML scan report (per the
 * Checkmarx Python SDK).
 */

export interface CxSastProject {
  id: number;
  name: string;
  teamId?: string;
}

export interface CxSastScan {
  id: number;
  status?: { id?: number; name?: string };
  dateAndTime?: { finishedOn?: string };
}

export interface CxSastReportRegistration {
  reportId: number;
}

export interface CxSastReportStatus {
  status: { id?: number; value: string };
}

/**
 * A single flattened result parsed out of the XML report: the weakness (query)
 * joined with one occurrence. `similarityId` (from the report's `<Path>` node) is
 * stable across scans and is what we deduplicate on.
 */
export interface CxSastFinding {
  queryId: string;
  queryName: string;
  cweId: number | null;
  group: string | null;
  severity: string;
  fileName: string;
  line: number | null;
  similarityId: string;
}
