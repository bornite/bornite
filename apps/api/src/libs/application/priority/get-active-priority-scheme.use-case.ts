import type { PriorityScheme, PrioritySchemeRepository } from '../../domain';

/**
 * Read the deployment's active priority scheme (levels + rules), or null if none
 * has been configured yet. A thin query use case; the HTTP edge shapes it into a
 * response DTO.
 */
export class GetActivePriorityScheme {
  public constructor(private readonly schemes: PrioritySchemeRepository) {}

  public execute(): Promise<PriorityScheme | null> {
    return this.schemes.findActive();
  }
}
