import { Repository as TypeOrmRepository } from 'typeorm';
import { Source, SourceRepository } from '../../../../domain';
import { SourceEntity } from '../entities/source.entity';
import { SourceMapper } from '../mappers/source.mapper';
import { PostgresRepository } from './postgres.repository';

export class PostgresSourceRepository
  extends PostgresRepository<Source, SourceEntity>
  implements SourceRepository
{
  public constructor(repository: TypeOrmRepository<SourceEntity>) {
    super(repository, new SourceMapper());
  }

  public async findByName(name: string): Promise<Source | null> {
    const row = await this.repository.findOneBy({ name });
    return row === null ? null : this.mapper.toDomain(row);
  }
}
