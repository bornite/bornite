import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { ScanImportStatus } from '../../../../libs/domain';
import { ImportCountsRecord } from './records';

/** Postgres persistence model for the ScanImport provenance aggregate. */
@Entity('scan_imports')
@Index('idx_scan_imports_assessment', ['assessmentId'])
export class ScanImportEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'source_id', type: 'uuid' })
  sourceId!: string;

  @Column({ name: 'assessment_id', type: 'uuid', nullable: true })
  assessmentId!: string | null;

  @Column({ type: 'varchar', length: 16 })
  status!: ScanImportStatus;

  @Column({ name: 'scan_type', type: 'varchar', length: 255 })
  scanType!: string;

  @Column({ name: 'file_name', type: 'varchar', length: 1024, nullable: true })
  fileName!: string | null;

  @Column({ name: 'reported_at', type: 'timestamptz', nullable: true })
  reportedAt!: Date | null;

  @Column({ name: 'imported_at', type: 'timestamptz' })
  importedAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  counts!: ImportCountsRecord | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;
}
