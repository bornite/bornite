import { AssetIdentifierKind, AssetType, SeverityLevel, VulnerabilitySystem } from '../../../../domain';
import { NormalizedRecord } from '../../../../application';
import { CxSastFinding, CxSastProject } from './checkmarx-sast.types';

const SEVERITY: Readonly<Record<string, SeverityLevel>> = {
  critical: SeverityLevel.Critical,
  high: SeverityLevel.High,
  medium: SeverityLevel.Medium,
  low: SeverityLevel.Low,
  info: SeverityLevel.Info,
  information: SeverityLevel.Info,
  informational: SeverityLevel.Info,
};

function mapSeverity(value: string): SeverityLevel {
  return SEVERITY[value.trim().toLowerCase()] ?? SeverityLevel.Info;
}

function basename(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] || path;
}

/**
 * Map a CxSAST finding (a weakness query joined with one code occurrence) into a
 * Bornite {@link NormalizedRecord}. SAST has no CVE/CVSS: the vulnerability is the
 * query (identified as a plugin id, carrying its CWE), and the finding location is
 * a source file + line. The stable `similarityId` becomes the dedup id.
 */
export function toCheckmarxSastRecord(project: CxSastProject, finding: CxSastFinding): NormalizedRecord {
  const severity = mapSeverity(finding.severity);
  const where = finding.line === null ? basename(finding.fileName) : `${basename(finding.fileName)}:${finding.line}`;

  return {
    asset: {
      type: AssetType.CodeRepository,
      name: project.name,
      identifiers: [
        { kind: AssetIdentifierKind.ExternalId, value: `checkmarx-sast:project:${project.id}` },
      ],
    },
    vulnerability: {
      identifiers: [{ system: VulnerabilitySystem.PluginId, value: `cxsast:query:${finding.queryId}` }],
      title: finding.queryName,
      baseSeverity: severity,
      cwes: finding.cweId === null ? undefined : [finding.cweId],
    },
    finding: {
      title: `${finding.queryName} in ${where}`,
      severity,
      uniqueIdFromTool: finding.similarityId.length > 0 ? finding.similarityId : undefined,
      vulnIdFromTool: finding.queryId,
      location: {
        filePath: finding.fileName.length > 0 ? finding.fileName : undefined,
        line: finding.line ?? undefined,
        symbol: finding.queryName,
      },
    },
  };
}
