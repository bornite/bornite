import { Repository as TypeOrmRepository } from 'typeorm';
import { FindingGroup, FindingGroupRepository } from '../../../../libs/domain';
import { FindingGroupEntity } from '../entities/finding-group.entity';
import { FindingGroupMapper } from '../mappers/finding-group.mapper';
import { PostgresRepository } from './postgres.repository';

export class PostgresFindingGroupRepository
  extends PostgresRepository<FindingGroup, FindingGroupEntity>
  implements FindingGroupRepository
{
  public constructor(repository: TypeOrmRepository<FindingGroupEntity>) {
    super(repository, new FindingGroupMapper());
  }
}
