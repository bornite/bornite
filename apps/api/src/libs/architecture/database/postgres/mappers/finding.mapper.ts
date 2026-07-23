import {
  Finding,
  FindingFingerprint,
  FindingLocation,
  PriorityAssignment,
  RiskScore,
  Severity,
} from '../../../../domain';
import { FindingEntity } from '../entities/finding.entity';
import { Mapper } from './mapper';

export class FindingMapper implements Mapper<Finding, FindingEntity> {
  public toDomain(row: FindingEntity): Finding {
    return Finding.reconstitute(
      {
        assetId: row.assetId,
        vulnerabilityDefinitionId: row.vulnerabilityDefinitionId,
        sourceId: row.sourceId,
        scanImportId: row.scanImportId,
        assessmentId: row.assessmentId,
        title: row.title,
        status: row.status,
        severity: Severity.of(row.severity),
        confidence: row.confidence,
        riskScore: row.riskScore === null ? null : RiskScore.of(row.riskScore),
        priority:
          row.priorityLevelKey === null ||
          row.priorityRank === null ||
          row.prioritySchemeVersion === null ||
          row.priorityEvaluatedAt === null
            ? null
            : PriorityAssignment.of({
                levelKey: row.priorityLevelKey,
                rank: row.priorityRank,
                matchedRuleId: row.priorityMatchedRuleId,
                schemeVersion: row.prioritySchemeVersion,
                evaluatedAt: row.priorityEvaluatedAt,
              }),
        location: row.location === null ? null : FindingLocation.reconstitute(row.location),
        fingerprint: row.fingerprint === null ? null : FindingFingerprint.of(row.fingerprint),
        uniqueIdFromTool: row.uniqueIdFromTool,
        vulnIdFromTool: row.vulnIdFromTool,
        duplicateOfId: row.duplicateOfId,
        riskAcceptanceId: row.riskAcceptanceId,
        firstDetectedAt: row.firstDetectedAt,
        lastDetectedAt: row.lastDetectedAt,
        statusChangedAt: row.statusChangedAt,
        mitigatedAt: row.mitigatedAt,
        createdAt: row.createdAt,
      },
      row.id,
    );
  }

  public toOrm(finding: Finding): FindingEntity {
    const s = finding.snapshot();
    const row = new FindingEntity();
    row.id = finding.id;
    row.assetId = s.assetId;
    row.vulnerabilityDefinitionId = s.vulnerabilityDefinitionId;
    row.sourceId = s.sourceId;
    row.scanImportId = s.scanImportId;
    row.assessmentId = s.assessmentId;
    row.title = s.title;
    row.status = s.status;
    row.severity = s.severity.level;
    row.confidence = s.confidence;
    row.riskScore = s.riskScore === null ? null : s.riskScore.value;
    row.priorityLevelKey = s.priority?.levelKey ?? null;
    row.priorityRank = s.priority?.rank ?? null;
    row.priorityMatchedRuleId = s.priority ? s.priority.matchedRuleId : null;
    row.prioritySchemeVersion = s.priority?.schemeVersion ?? null;
    row.priorityEvaluatedAt = s.priority?.evaluatedAt ?? null;
    row.location =
      s.location === null
        ? null
        : {
            filePath: s.location.filePath,
            line: s.location.line,
            symbol: s.location.symbol,
            endpoint: s.location.endpoint,
            port: s.location.port,
          };
    row.fingerprint = s.fingerprint === null ? null : s.fingerprint.value;
    row.uniqueIdFromTool = s.uniqueIdFromTool;
    row.vulnIdFromTool = s.vulnIdFromTool;
    row.duplicateOfId = s.duplicateOfId;
    row.riskAcceptanceId = s.riskAcceptanceId;
    row.firstDetectedAt = s.firstDetectedAt;
    row.lastDetectedAt = s.lastDetectedAt;
    row.statusChangedAt = s.statusChangedAt;
    row.mitigatedAt = s.mitigatedAt;
    row.createdAt = s.createdAt;
    return row;
  }
}
