import {
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository as TypeOrmRepository,
} from 'typeorm';
import { Repository as DomainRepository } from '../../../../domain';
import { Mapper } from '../mappers/mapper';

/**
 * Generic Postgres implementation of the domain {@link DomainRepository} port.
 * Concrete repositories extend this to inherit `findById`/`save`/`delete` and add
 * their own aggregate-specific queries. All persistence detail (TypeORM, SQL) is
 * confined here and in the ORM entities/mappers; the domain sees only the port.
 *
 * No `DataSource`/connection is wired in this task — a repository is constructed
 * with a TypeORM `Repository<TOrm>` obtained from a data source elsewhere.
 */
export abstract class PostgresRepository<TDomain, TOrm extends ObjectLiteral & { id: string }>
  implements DomainRepository<TDomain>
{
  protected constructor(
    protected readonly repository: TypeOrmRepository<TOrm>,
    protected readonly mapper: Mapper<TDomain, TOrm>,
  ) {}

  public async findById(id: string): Promise<TDomain | null> {
    const row = await this.repository.findOneBy({ id } as FindOptionsWhere<TOrm>);
    return row === null ? null : this.mapper.toDomain(row);
  }

  public async save(aggregate: TDomain): Promise<void> {
    await this.repository.save(this.mapper.toOrm(aggregate) as DeepPartial<TOrm>);
  }

  public async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
