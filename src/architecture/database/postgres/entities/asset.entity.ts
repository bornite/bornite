import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AssetCriticality, AssetType } from '../../../../libs/domain';
import { AssetIdentifierRecord } from './records';

/**
 * Postgres persistence model for the Asset aggregate. Distinct from the domain
 * {@link Asset}: this class knows about tables and columns, the domain one knows
 * about behaviour and invariants. The mapper bridges the two.
 */
@Entity('assets')
export class AssetEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: AssetType;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  /** Array of { kind, value } — the asset's identifiers. */
  @Column({ type: 'jsonb' })
  identifiers!: AssetIdentifierRecord[];

  @Column({ type: 'varchar', length: 16 })
  criticality!: AssetCriticality;

  @Column({ type: 'varchar', length: 255, nullable: true })
  owner!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  tags!: string[];

  @Column({ name: 'first_seen_at', type: 'timestamptz' })
  firstSeenAt!: Date;

  @Column({ name: 'last_seen_at', type: 'timestamptz' })
  lastSeenAt!: Date;

  @Column({ name: 'decommissioned_at', type: 'timestamptz', nullable: true })
  decommissionedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
