import { Column, Entity, PrimaryColumn } from 'typeorm';
import { FindingGroupBy } from '../../../../libs/domain';

/** Postgres persistence model for the FindingGroup aggregate. */
@Entity('finding_groups')
export class FindingGroupEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'group_by', type: 'varchar', length: 32 })
  groupBy!: FindingGroupBy;

  @Column({ name: 'assessment_id', type: 'uuid', nullable: true })
  assessmentId!: string | null;

  /** Array of member finding ids. */
  @Column({ name: 'member_finding_ids', type: 'jsonb', default: () => "'[]'::jsonb" })
  memberFindingIds!: string[];

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
