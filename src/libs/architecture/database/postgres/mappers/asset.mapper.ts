import { Asset, AssetIdentifier } from '../../../../domain';
import { AssetEntity } from '../entities/asset.entity';
import { Mapper } from './mapper';

export class AssetMapper implements Mapper<Asset, AssetEntity> {
  public toDomain(row: AssetEntity): Asset {
    return Asset.reconstitute(
      {
        type: row.type,
        name: row.name,
        identifiers: row.identifiers.map((r) => AssetIdentifier.create(r.kind, r.value)),
        criticality: row.criticality,
        owner: row.owner,
        tags: row.tags,
        firstSeenAt: row.firstSeenAt,
        lastSeenAt: row.lastSeenAt,
        decommissionedAt: row.decommissionedAt,
        createdAt: row.createdAt,
      },
      row.id,
    );
  }

  public toOrm(asset: Asset): AssetEntity {
    const s = asset.snapshot();
    const row = new AssetEntity();
    row.id = asset.id;
    row.type = s.type;
    row.name = s.name;
    row.identifiers = s.identifiers.map((i) => ({ kind: i.kind, value: i.value }));
    row.criticality = s.criticality;
    row.owner = s.owner;
    row.tags = [...s.tags];
    row.firstSeenAt = s.firstSeenAt;
    row.lastSeenAt = s.lastSeenAt;
    row.decommissionedAt = s.decommissionedAt;
    row.createdAt = s.createdAt;
    return row;
  }
}
