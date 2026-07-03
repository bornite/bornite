import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AssessmentStatus } from '../../../../domain';

/** Postgres persistence model for the Assessment (scan-grouping) aggregate. */
@Entity('assessments')
export class AssessmentEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 300 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 16 })
  status!: AssessmentStatus;

  @Column({ name: 'planned_start', type: 'timestamptz' })
  plannedStart!: Date;

  @Column({ name: 'planned_end', type: 'timestamptz', nullable: true })
  plannedEnd!: Date | null;

  @Column({ name: 'actual_start', type: 'timestamptz', nullable: true })
  actualStart!: Date | null;

  @Column({ name: 'actual_end', type: 'timestamptz', nullable: true })
  actualEnd!: Date | null;

  @Column({ name: 'deduplication_scoped', type: 'boolean', default: false })
  deduplicationScoped!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
