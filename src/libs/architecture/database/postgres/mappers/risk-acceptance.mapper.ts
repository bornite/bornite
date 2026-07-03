import { RiskAcceptance } from '../../../../domain';
import { RiskAcceptanceEntity } from '../entities/risk-acceptance.entity';
import { Mapper } from './mapper';

export class RiskAcceptanceMapper implements Mapper<RiskAcceptance, RiskAcceptanceEntity> {
  public toDomain(row: RiskAcceptanceEntity): RiskAcceptance {
    return RiskAcceptance.reconstitute(
      {
        name: row.name,
        decision: row.decision,
        justification: row.justification,
        acceptedFindingIds: [...row.acceptedFindingIds],
        owner: row.owner,
        acceptedBy: row.acceptedBy,
        expiresAt: row.expiresAt,
        reactivateOnExpiry: row.reactivateOnExpiry,
        proofRef: row.proofRef,
        handledAt: row.handledAt,
        createdAt: row.createdAt,
      },
      row.id,
    );
  }

  public toOrm(acceptance: RiskAcceptance): RiskAcceptanceEntity {
    const s = acceptance.snapshot();
    const row = new RiskAcceptanceEntity();
    row.id = acceptance.id;
    row.name = s.name;
    row.decision = s.decision;
    row.justification = s.justification;
    row.acceptedFindingIds = [...s.acceptedFindingIds];
    row.owner = s.owner;
    row.acceptedBy = s.acceptedBy;
    row.expiresAt = s.expiresAt;
    row.reactivateOnExpiry = s.reactivateOnExpiry;
    row.proofRef = s.proofRef;
    row.handledAt = s.handledAt;
    row.createdAt = s.createdAt;
    return row;
  }
}
