import { Column, Entity, PrimaryColumn } from 'typeorm';
import { RiskTreatment } from '../../../../domain';

/** Postgres persistence model for the RiskAcceptance aggregate. */
@Entity('risk_acceptances')
export class RiskAcceptanceEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 300 })
  name!: string;

  @Column({ type: 'varchar', length: 16 })
  decision!: RiskTreatment;

  @Column({ type: 'text', nullable: true })
  justification!: string | null;

  /** Array of finding ids covered by this acceptance. */
  @Column({ name: 'accepted_finding_ids', type: 'jsonb', default: () => "'[]'::jsonb" })
  acceptedFindingIds!: string[];

  @Column({ type: 'varchar', length: 255 })
  owner!: string;

  @Column({ name: 'accepted_by', type: 'varchar', length: 255, nullable: true })
  acceptedBy!: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'reactivate_on_expiry', type: 'boolean', default: true })
  reactivateOnExpiry!: boolean;

  @Column({ name: 'proof_ref', type: 'varchar', length: 1024, nullable: true })
  proofRef!: string | null;

  @Column({ name: 'handled_at', type: 'timestamptz', nullable: true })
  handledAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
