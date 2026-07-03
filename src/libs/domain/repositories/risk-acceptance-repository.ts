import { RiskAcceptance } from '../entities/risk-acceptance';
import { FindingId, RiskAcceptanceId } from '../shared/identifiers';
import { Repository } from './repository';

export interface RiskAcceptanceRepository extends Repository<RiskAcceptance, RiskAcceptanceId> {
  /** Acceptances whose expiry has passed and not yet been handled — the expiry job. */
  findExpirable(asOf: Date): Promise<RiskAcceptance[]>;

  /** Acceptances covering a given finding. */
  findByFinding(findingId: FindingId): Promise<RiskAcceptance[]>;
}
