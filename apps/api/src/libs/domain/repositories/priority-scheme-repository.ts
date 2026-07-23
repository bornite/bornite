import { PriorityScheme } from '../entities/priority-scheme';
import { PrioritySchemeId } from '../shared/identifiers';
import { Repository } from './repository';

/**
 * Persistence port for the {@link PriorityScheme} aggregate. bornite is
 * single-tenant per deployment, so there is at most one *active* scheme; the
 * infrastructure adapter enforces that. The write side loads/saves the whole
 * aggregate; reads for display go through the query side.
 */
export interface PrioritySchemeRepository extends Repository<PriorityScheme, PrioritySchemeId> {
  /** The single active scheme for this deployment, or null if none is configured. */
  findActive(): Promise<PriorityScheme | null>;
}
