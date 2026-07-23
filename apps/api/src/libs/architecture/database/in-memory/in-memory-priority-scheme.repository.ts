import { PriorityScheme, PrioritySchemeRepository } from '../../../domain';

/**
 * In-memory implementation of the {@link PrioritySchemeRepository}. Single-tenant:
 * `findActive` returns the highest-version active scheme, mirroring the Postgres
 * adapter so behaviour is identical with zero setup.
 */
export class InMemoryPrioritySchemeRepository implements PrioritySchemeRepository {
  private readonly items = new Map<string, PriorityScheme>();

  public async findById(id: string): Promise<PriorityScheme | null> {
    return this.items.get(id) ?? null;
  }

  public async save(scheme: PriorityScheme): Promise<void> {
    this.items.set(scheme.id, scheme);
  }

  public async delete(id: string): Promise<void> {
    this.items.delete(id);
  }

  public async findActive(): Promise<PriorityScheme | null> {
    let active: PriorityScheme | null = null;
    for (const scheme of this.items.values()) {
      if (scheme.active && (active === null || scheme.version > active.version)) {
        active = scheme;
      }
    }
    return active;
  }
}
