import { RiskTreatment } from '../enums/risk-treatment';
import { AggregateRoot } from '../shared/aggregate-root';
import { FindingId, RiskAcceptanceId } from '../shared/identifiers';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';

export interface RiskAcceptanceProps {
  name: string;
  decision: RiskTreatment;
  justification: string | null;
  acceptedFindingIds: FindingId[];
  owner: string;
  acceptedBy: string | null;
  expiresAt: Date | null;
  reactivateOnExpiry: boolean;
  proofRef: string | null;
  handledAt: Date | null;
  createdAt: Date;
}

export interface CreateRiskAcceptanceInput {
  name: string;
  owner: string;
  decision?: RiskTreatment;
  justification?: string;
  acceptedFindingIds?: FindingId[];
  acceptedBy?: string;
  expiresAt?: Date;
  reactivateOnExpiry?: boolean;
  proofRef?: string;
  now: Date;
}

/**
 * A formal decision to accept (or otherwise treat) the risk of one or more
 * findings, with an owner, justification, optional proof and optional expiry.
 *
 * Aggregate root. It references the findings it covers by id; the reciprocal link
 * lives on {@link Finding} (its `riskAcceptanceId`), and an application service
 * keeps the two in step (`RiskAcceptance.addFinding` + `Finding.accept`).
 */
export class RiskAcceptance extends AggregateRoot<RiskAcceptanceProps> {
  private constructor(props: RiskAcceptanceProps, id: RiskAcceptanceId) {
    super(props, id);
  }

  public static create(input: CreateRiskAcceptanceInput, id: RiskAcceptanceId): RiskAcceptance {
    return new RiskAcceptance(
      {
        name: parse(nonEmptyString, input.name, 'Risk acceptance name'),
        decision: input.decision ?? RiskTreatment.Accept,
        justification: input.justification?.trim() || null,
        acceptedFindingIds: input.acceptedFindingIds ? [...new Set(input.acceptedFindingIds)] : [],
        owner: parse(nonEmptyString, input.owner, 'Risk acceptance owner'),
        acceptedBy: input.acceptedBy?.trim() || null,
        expiresAt: input.expiresAt ?? null,
        reactivateOnExpiry: input.reactivateOnExpiry ?? true,
        proofRef: input.proofRef?.trim() || null,
        handledAt: null,
        createdAt: input.now,
      },
      id,
    );
  }

  public static reconstitute(props: RiskAcceptanceProps, id: RiskAcceptanceId): RiskAcceptance {
    return new RiskAcceptance(props, id);
  }

  public get name(): string {
    return this.props.name;
  }

  public get decision(): RiskTreatment {
    return this.props.decision;
  }

  public get reactivateOnExpiry(): boolean {
    return this.props.reactivateOnExpiry;
  }

  public get acceptedFindingIds(): readonly FindingId[] {
    return this.props.acceptedFindingIds;
  }

  public covers(findingId: FindingId): boolean {
    return this.props.acceptedFindingIds.includes(findingId);
  }

  public addFinding(findingId: FindingId): void {
    if (!this.covers(findingId)) {
      this.props.acceptedFindingIds.push(findingId);
    }
  }

  public removeFinding(findingId: FindingId): void {
    this.props.acceptedFindingIds = this.props.acceptedFindingIds.filter((id) => id !== findingId);
  }

  /** Expired once a set expiry has passed. An open-ended acceptance never expires. */
  public isExpired(at: Date): boolean {
    return this.props.expiresAt !== null && at.getTime() >= this.props.expiresAt.getTime();
  }

  public isHandled(): boolean {
    return this.props.handledAt !== null;
  }

  /** Mark the expiry as processed (findings reactivated by an application service). */
  public markExpirationHandled(at: Date): void {
    this.props.handledAt = at;
  }
}
