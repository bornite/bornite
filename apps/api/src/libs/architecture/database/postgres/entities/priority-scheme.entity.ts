import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { PriorityLevelRecord, PriorityRuleRecord } from './records';

/**
 * Postgres persistence model for the {@link PriorityScheme} aggregate. Levels and
 * rules are stored as `jsonb` (following the codebase convention for value-object
 * collections); the mapper rebuilds the real value objects. `active` is indexed so
 * the single active scheme is a cheap lookup.
 */
@Entity('priority_schemes')
export class PrioritySchemeEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 300 })
  name!: string;

  @Column({ type: 'jsonb' })
  levels!: PriorityLevelRecord[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  rules!: PriorityRuleRecord[];

  @Column({ name: 'default_level_key', type: 'varchar', length: 16 })
  defaultLevelKey!: string;

  @Index('idx_priority_schemes_active')
  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'integer' })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
