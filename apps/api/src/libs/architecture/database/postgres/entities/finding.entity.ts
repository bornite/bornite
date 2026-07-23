import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { ConfidenceLevel, FindingStatus, SeverityLevel } from '../../../../domain';
import { FindingLocationRecord } from './records';

/**
 * Postgres persistence model for the central Finding aggregate.
 *
 * Cross-aggregate references are stored as bare id columns (indexed) rather than
 * ORM relations, keeping each aggregate independently loadable — the mapper never
 * has to hydrate a foreign aggregate to rebuild a finding.
 */
@Entity('findings')
@Index('idx_findings_asset', ['assetId'])
@Index('idx_findings_definition', ['vulnerabilityDefinitionId'])
@Index('idx_findings_fingerprint', ['assetId', 'fingerprint'])
export class FindingEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'vulnerability_definition_id', type: 'uuid' })
  vulnerabilityDefinitionId!: string;

  @Column({ name: 'source_id', type: 'uuid' })
  sourceId!: string;

  @Column({ name: 'scan_import_id', type: 'uuid', nullable: true })
  scanImportId!: string | null;

  @Column({ name: 'assessment_id', type: 'uuid', nullable: true })
  assessmentId!: string | null;

  @Column({ type: 'varchar', length: 512 })
  title!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: FindingStatus;

  @Column({ type: 'varchar', length: 16 })
  severity!: SeverityLevel;

  @Column({ type: 'varchar', length: 16, nullable: true })
  confidence!: ConfidenceLevel | null;

  @Column({ name: 'risk_score', type: 'double precision', nullable: true })
  riskScore!: number | null;

  @Column({ name: 'priority_level_key', type: 'varchar', length: 16, nullable: true })
  priorityLevelKey!: string | null;

  @Index('idx_findings_priority_rank')
  @Column({ name: 'priority_rank', type: 'integer', nullable: true })
  priorityRank!: number | null;

  @Column({ name: 'priority_matched_rule_id', type: 'varchar', length: 128, nullable: true })
  priorityMatchedRuleId!: string | null;

  @Column({ name: 'priority_scheme_version', type: 'integer', nullable: true })
  prioritySchemeVersion!: number | null;

  @Column({ name: 'priority_evaluated_at', type: 'timestamptz', nullable: true })
  priorityEvaluatedAt!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  location!: FindingLocationRecord | null;

  @Index('idx_findings_fingerprint_lookup')
  @Column({ type: 'varchar', length: 1024, nullable: true })
  fingerprint!: string | null;

  @Column({ name: 'unique_id_from_tool', type: 'varchar', length: 512, nullable: true })
  uniqueIdFromTool!: string | null;

  @Column({ name: 'vuln_id_from_tool', type: 'varchar', length: 512, nullable: true })
  vulnIdFromTool!: string | null;

  @Column({ name: 'duplicate_of_id', type: 'uuid', nullable: true })
  duplicateOfId!: string | null;

  @Column({ name: 'risk_acceptance_id', type: 'uuid', nullable: true })
  riskAcceptanceId!: string | null;

  @Column({ name: 'first_detected_at', type: 'timestamptz' })
  firstDetectedAt!: Date;

  @Column({ name: 'last_detected_at', type: 'timestamptz' })
  lastDetectedAt!: Date;

  @Column({ name: 'status_changed_at', type: 'timestamptz' })
  statusChangedAt!: Date;

  @Column({ name: 'mitigated_at', type: 'timestamptz', nullable: true })
  mitigatedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
