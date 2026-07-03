import { FindingRepository, RiskAcceptance, RiskAcceptanceRepository } from '../../domain';
import { NotFoundError } from '../errors/not-found.error';
import { Clock } from '../ports/clock';
import { IdGenerator } from '../ports/id-generator';

/** Input for {@link AcceptFinding} — a write command. */
export interface AcceptFindingCommand {
  readonly findingId: string;
  readonly owner: string;
  readonly justification?: string;
  readonly expiresAt?: Date;
}

/**
 * Accept the risk of a finding: record a {@link RiskAcceptance} and move the
 * finding to RISK_ACCEPTED. Coordinating two aggregates in one transaction is
 * exactly what a use case is for. The domain enforces the transition
 * (`Finding.accept` rejects non-open findings).
 */
export class AcceptFinding {
  public constructor(
    private readonly findings: FindingRepository,
    private readonly riskAcceptances: RiskAcceptanceRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  public async execute(command: AcceptFindingCommand): Promise<void> {
    const now = this.clock.now();
    const finding = await this.findings.findById(command.findingId);
    if (finding === null) {
      throw new NotFoundError(`Finding ${command.findingId} not found.`);
    }

    const acceptance = RiskAcceptance.create(
      {
        name: `Acceptance of ${finding.title}`,
        owner: command.owner,
        justification: command.justification,
        acceptedFindingIds: [finding.id],
        expiresAt: command.expiresAt,
        now,
      },
      this.ids.generate(),
    );

    finding.accept(acceptance.id, now);

    await this.riskAcceptances.save(acceptance);
    await this.findings.save(finding);
  }
}
