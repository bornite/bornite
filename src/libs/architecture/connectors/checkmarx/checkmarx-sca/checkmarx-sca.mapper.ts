import { AssetIdentifierKind, AssetType, SeverityLevel, VulnerabilitySystem } from '../../../../domain';
import { NormalizedRecord } from '../../../../application';
import { CheckmarxPackage, CheckmarxProject, CheckmarxVulnerability } from './checkmarx-sca.types';

const SEVERITY: Readonly<Record<string, SeverityLevel>> = {
  critical: SeverityLevel.Critical,
  high: SeverityLevel.High,
  medium: SeverityLevel.Medium,
  low: SeverityLevel.Low,
  none: SeverityLevel.Info,
};

function mapSeverity(value: string): SeverityLevel {
  return SEVERITY[value.trim().toLowerCase()] ?? SeverityLevel.Info;
}

function parseCwe(cwe: string | undefined): number[] | undefined {
  if (cwe === undefined) {
    return undefined;
  }
  const match = /(\d+)/.exec(cwe);
  return match === null ? undefined : [Number(match[1])];
}

/**
 * Map a Checkmarx SCA vulnerability (joined with its package) into a Bornite
 * {@link NormalizedRecord}. The project becomes the asset (a code repository),
 * the CVE/plugin id becomes the vulnerability, and the (package, vuln) pair
 * becomes the finding — with a stable `uniqueIdFromTool` for deduplication.
 *
 * Note: Checkmarx returns a structured `cvss` object rather than a vector string,
 * so we carry the numeric `score` and leave the CVSS vector unset.
 */
export function toCheckmarxScaRecord(
  project: CheckmarxProject,
  vulnerability: CheckmarxVulnerability,
  pkg: CheckmarxPackage | null,
): NormalizedRecord {
  const hasCve = vulnerability.cveName.length > 0;
  const component = pkg === null ? vulnerability.packageId : `${pkg.name}@${pkg.version}`;
  const label = hasCve ? vulnerability.cveName : vulnerability.id;
  const severity = mapSeverity(vulnerability.severity);

  return {
    asset: {
      type: AssetType.CodeRepository,
      name: project.name,
      identifiers: [
        { kind: AssetIdentifierKind.ExternalId, value: `checkmarx-sca:project:${project.id}` },
      ],
    },
    vulnerability: {
      identifiers: hasCve
        ? [{ system: VulnerabilitySystem.Cve, value: vulnerability.cveName }]
        : [{ system: VulnerabilitySystem.PluginId, value: vulnerability.id }],
      title: label,
      baseSeverity: severity,
      description: vulnerability.description,
      cwes: parseCwe(vulnerability.cwe),
      cvssScore: vulnerability.score,
      references: vulnerability.references,
    },
    finding: {
      title: `${label} in ${component}`,
      severity,
      uniqueIdFromTool: `${project.id}:${vulnerability.packageId}:${vulnerability.id}`,
      vulnIdFromTool: vulnerability.id,
      location: { symbol: component },
    },
  };
}
