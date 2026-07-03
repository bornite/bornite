import { FindingGroup } from '../entities/finding-group';
import { FindingGroupId } from '../shared/identifiers';
import { Repository } from './repository';

export type FindingGroupRepository = Repository<FindingGroup, FindingGroupId>;
