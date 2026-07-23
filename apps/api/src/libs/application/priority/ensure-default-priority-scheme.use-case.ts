import { buildDefaultPriorityScheme, PriorityScheme, PrioritySchemeRepository } from '../../domain';
import { Clock } from '../ports/clock';
import { IdGenerator } from '../ports/id-generator';

/**
 * Guarantee that a deployment has an active priority scheme: if one already
 * exists, return it untouched; otherwise provision the built-in default (see
 * {@link buildDefaultPriorityScheme}) and persist it. Idempotent — safe to run on
 * every boot.
 */
export class EnsureDefaultPriorityScheme {
  public constructor(
    private readonly schemes: PrioritySchemeRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  public async execute(): Promise<PriorityScheme> {
    const existing = await this.schemes.findActive();
    if (existing !== null) {
      return existing;
    }
    const scheme = buildDefaultPriorityScheme(this.ids.generate(), this.clock.now());
    await this.schemes.save(scheme);
    return scheme;
  }
}
