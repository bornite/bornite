import { Repository as TypeOrmRepository } from 'typeorm';
import { Asset, AssetIdentifier, AssetRepository } from '../../../../libs/domain';
import { AssetEntity } from '../entities/asset.entity';
import { AssetMapper } from '../mappers/asset.mapper';
import { PostgresRepository } from './postgres.repository';

export class PostgresAssetRepository
  extends PostgresRepository<Asset, AssetEntity>
  implements AssetRepository
{
  public constructor(repository: TypeOrmRepository<AssetEntity>) {
    super(repository, new AssetMapper());
  }

  public async findByIdentifiers(identifiers: readonly AssetIdentifier[]): Promise<Asset | null> {
    if (identifiers.length === 0) {
      return null;
    }
    // Match a row whose `identifiers` jsonb array contains any of the given ones.
    const qb = this.repository.createQueryBuilder('asset');
    identifiers.forEach((identifier, index) => {
      const contained = JSON.stringify([{ kind: identifier.kind, value: identifier.value }]);
      qb.orWhere(`asset.identifiers @> :ident${index}`, { [`ident${index}`]: contained });
    });
    const row = await qb.getOne();
    return row === null ? null : this.mapper.toDomain(row);
  }
}
