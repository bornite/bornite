import { FindingGroup } from '../../../../domain';
import { FindingGroupEntity } from '../entities/finding-group.entity';
import { Mapper } from './mapper';

export class FindingGroupMapper implements Mapper<FindingGroup, FindingGroupEntity> {
  public toDomain(row: FindingGroupEntity): FindingGroup {
    return FindingGroup.reconstitute(
      {
        name: row.name,
        groupBy: row.groupBy,
        assessmentId: row.assessmentId,
        memberFindingIds: [...row.memberFindingIds],
        createdAt: row.createdAt,
      },
      row.id,
    );
  }

  public toOrm(group: FindingGroup): FindingGroupEntity {
    const s = group.snapshot();
    const row = new FindingGroupEntity();
    row.id = group.id;
    row.name = s.name;
    row.groupBy = s.groupBy;
    row.assessmentId = s.assessmentId;
    row.memberFindingIds = [...s.memberFindingIds];
    row.createdAt = s.createdAt;
    return row;
  }
}
