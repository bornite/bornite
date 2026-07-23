import {
  AssetRepository,
  FindingRepository,
  PriorityEvaluationStrategy,
  PrioritySchemeRepository,
  VulnerabilityDefinitionRepository,
} from '../../domain';
import { Clock } from '../ports/clock';
import { buildPriorityEvaluationContext } from './priority-context';

export interface ReevaluateFindingsPriorityResult {
  /** The scheme version findings were (re)evaluated against, or null if none is active. */
  readonly schemeVersion: number | null;
  readonly evaluated: number;
  readonly skipped: number;
}

/**
 * Re-evaluate findings against the current active scheme — the work a scheme
 * revision triggers. Findings already assigned at the current version are skipped
 * (idempotent), so this is safe to re-run. Loads each finding's asset + definition
 * to rebuild the same facts ingestion used.
 *
 * NOTE: this is the use-case logic, not the scheduling. It loads all findings and
 * resolves context per finding (N+1); a batched/streamed background job is a
 * Phase-3 infrastructure concern that will drive this same logic.
 */
export class ReevaluateFindingsPriority {
  public constructor(
    private readonly schemes: PrioritySchemeRepository,
    private readonly findings: FindingRepository,
    private readonly assets: AssetRepository,
    private readonly definitions: VulnerabilityDefinitionRepository,
    private readonly strategy: PriorityEvaluationStrategy,
    private readonly clock: Clock,
  ) {}

  public async execute(): Promise<ReevaluateFindingsPriorityResult> {
    const scheme = await this.schemes.findActive();
    if (scheme === null) {
      return { schemeVersion: null, evaluated: 0, skipped: 0 };
    }

    const now = this.clock.now();
    let evaluated = 0;
    let skipped = 0;

    for (const finding of await this.findings.findAll()) {
      if (finding.priority !== null && !finding.priority.isStale(scheme.version)) {
        skipped += 1;
        continue;
      }
      const asset = await this.assets.findById(finding.assetId);
      const definition = await this.definitions.findById(finding.vulnerabilityDefinitionId);
      if (asset === null || definition === null) {
        skipped += 1;
        continue;
      }
      finding.applyPriority(this.strategy, scheme, buildPriorityEvaluationContext(definition, asset), now);
      await this.findings.save(finding);
      evaluated += 1;
    }

    return { schemeVersion: scheme.version, evaluated, skipped };
  }
}
