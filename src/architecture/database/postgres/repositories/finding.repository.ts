import { FindOptionsWhere, Repository as TypeOrmRepository } from 'typeorm';
import { Finding, FindingFingerprint, FindingRepository } from '../../../../libs/domain';
import { FindingEntity } from '../entities/finding.entity';
import { FindingMapper } from '../mappers/finding.mapper';
import { PostgresRepository } from './postgres.repository';

export class PostgresFindingRepository
  extends PostgresRepository<Finding, FindingEntity>
  implements FindingRepository
{
  public constructor(repository: TypeOrmRepository<FindingEntity>) {
    super(repository, new FindingMapper());
  }

  public async findByFingerprint(
    fingerprint: FindingFingerprint,
    assetId?: string,
  ): Promise<Finding | null> {
    const where: FindOptionsWhere<FindingEntity> = { fingerprint: fingerprint.value };
    if (assetId !== undefined) {
      where.assetId = assetId;
    }
    const row = await this.repository.findOneBy(where);
    return row === null ? null : this.mapper.toDomain(row);
  }

  public async findByAsset(assetId: string): Promise<Finding[]> {
    const rows = await this.repository.findBy({ assetId } as FindOptionsWhere<FindingEntity>);
    return rows.map((row) => this.mapper.toDomain(row));
  }
}
