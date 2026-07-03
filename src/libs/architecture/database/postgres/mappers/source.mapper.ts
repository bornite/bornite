import { Source } from '../../../../domain';
import { SourceEntity } from '../entities/source.entity';
import { Mapper } from './mapper';

export class SourceMapper implements Mapper<Source, SourceEntity> {
  public toDomain(row: SourceEntity): Source {
    return Source.reconstitute(
      {
        name: row.name,
        type: row.type,
        vendor: row.vendor,
        description: row.description,
        enabled: row.enabled,
        createdAt: row.createdAt,
      },
      row.id,
    );
  }

  public toOrm(source: Source): SourceEntity {
    const s = source.snapshot();
    const row = new SourceEntity();
    row.id = source.id;
    row.name = s.name;
    row.type = s.type;
    row.vendor = s.vendor;
    row.description = s.description;
    row.enabled = s.enabled;
    row.createdAt = s.createdAt;
    return row;
  }
}
