import { PriorityScheme, PrioritySchemeRepository, RevisePrioritySchemeInput } from '../../domain';
import { NotFoundError } from '../errors/not-found.error';
import { Clock } from '../ports/clock';

/**
 * Apply an edit to the active priority scheme: re-validate the new definition,
 * bump its version, and persist. The version bump is what a background
 * re-evaluation keys off (findings carry the version that produced their
 * assignment). Domain VOs (levels/rules) are built at the HTTP edge; this use case
 * only orchestrates load → revise → save.
 */
export class RevisePriorityScheme {
  public constructor(
    private readonly schemes: PrioritySchemeRepository,
    private readonly clock: Clock,
  ) {}

  public async execute(input: RevisePrioritySchemeInput): Promise<PriorityScheme> {
    const scheme = await this.schemes.findActive();
    if (scheme === null) {
      throw new NotFoundError('No active priority scheme to revise.');
    }
    scheme.revise(input, this.clock.now());
    await this.schemes.save(scheme);
    return scheme;
  }
}
