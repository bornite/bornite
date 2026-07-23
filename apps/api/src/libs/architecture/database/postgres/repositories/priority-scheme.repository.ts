import { FindOptionsWhere, Repository as TypeOrmRepository } from 'typeorm';
import { PriorityScheme, PrioritySchemeRepository } from '../../../../domain';
import { PrioritySchemeEntity } from '../entities/priority-scheme.entity';
import { PrioritySchemeMapper } from '../mappers/priority-scheme.mapper';
import { PostgresRepository } from './postgres.repository';

export class PostgresPrioritySchemeRepository
  extends PostgresRepository<PriorityScheme, PrioritySchemeEntity>
  implements PrioritySchemeRepository
{
  public constructor(repository: TypeOrmRepository<PrioritySchemeEntity>) {
    super(repository, new PrioritySchemeMapper());
  }

  public async findActive(): Promise<PriorityScheme | null> {
    const row = await this.repository.findOne({
      where: { active: true } as FindOptionsWhere<PrioritySchemeEntity>,
      order: { version: 'DESC' },
    });
    return row === null ? null : this.mapper.toDomain(row);
  }
}
