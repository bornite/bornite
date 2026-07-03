import { Column, Entity, PrimaryColumn } from 'typeorm';
import { SourceType } from '../../../../libs/domain';

/** Postgres persistence model for the Source registry aggregate. */
@Entity('sources')
export class SourceEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: SourceType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vendor!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
