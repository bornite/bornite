import { RiskAcceptance, RiskAcceptanceRepository } from '../../../domain';

/** In-memory implementation of the RiskAcceptance write repository. */
export class InMemoryRiskAcceptanceRepository implements RiskAcceptanceRepository {
  private readonly items = new Map<string, RiskAcceptance>();

  public async findById(id: string): Promise<RiskAcceptance | null> {
    return this.items.get(id) ?? null;
  }

  public async save(acceptance: RiskAcceptance): Promise<void> {
    this.items.set(acceptance.id, acceptance);
  }

  public async delete(id: string): Promise<void> {
    this.items.delete(id);
  }

  public async findExpirable(asOf: Date): Promise<RiskAcceptance[]> {
    return [...this.items.values()].filter((ra) => ra.isExpired(asOf) && !ra.isHandled());
  }

  public async findByFinding(findingId: string): Promise<RiskAcceptance[]> {
    return [...this.items.values()].filter((ra) => ra.covers(findingId));
  }
}
