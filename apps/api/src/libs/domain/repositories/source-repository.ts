import { Source } from '../entities/source';
import { SourceId } from '../shared/identifiers';
import { Repository } from './repository';

export interface SourceRepository extends Repository<Source, SourceId> {
  findByName(name: string): Promise<Source | null>;
}
