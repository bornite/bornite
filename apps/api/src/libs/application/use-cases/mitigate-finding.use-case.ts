import { FindingRepository } from '../../domain';
import { NotFoundError } from '../errors/not-found.error';
import { Clock } from '../ports/clock';

/** Input for {@link MitigateFinding} — a write command. */
export interface MitigateFindingCommand {
  readonly findingId: string;
}

/**
 * Mark a finding as mitigated (remediation applied). The domain enforces the
 * transition (`Finding.mitigate` rejects e.g. already-resolved findings).
 */
export class MitigateFinding {
  public constructor(
    private readonly findings: FindingRepository,
    private readonly clock: Clock,
  ) {}

  public async execute(command: MitigateFindingCommand): Promise<void> {
    const now = this.clock.now();
    const finding = await this.findings.findById(command.findingId);
    if (finding === null) {
      throw new NotFoundError(`Finding ${command.findingId} not found.`);
    }
    finding.mitigate(now);
    await this.findings.save(finding);
  }
}
