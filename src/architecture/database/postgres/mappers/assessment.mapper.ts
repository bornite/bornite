import { Assessment } from '../../../../libs/domain';
import { AssessmentEntity } from '../entities/assessment.entity';
import { Mapper } from './mapper';

export class AssessmentMapper implements Mapper<Assessment, AssessmentEntity> {
  public toDomain(row: AssessmentEntity): Assessment {
    return Assessment.reconstitute(
      {
        name: row.name,
        description: row.description,
        status: row.status,
        plannedStart: row.plannedStart,
        plannedEnd: row.plannedEnd,
        actualStart: row.actualStart,
        actualEnd: row.actualEnd,
        deduplicationScoped: row.deduplicationScoped,
        createdAt: row.createdAt,
      },
      row.id,
    );
  }

  public toOrm(assessment: Assessment): AssessmentEntity {
    const s = assessment.snapshot();
    const row = new AssessmentEntity();
    row.id = assessment.id;
    row.name = s.name;
    row.description = s.description;
    row.status = s.status;
    row.plannedStart = s.plannedStart;
    row.plannedEnd = s.plannedEnd;
    row.actualStart = s.actualStart;
    row.actualEnd = s.actualEnd;
    row.deduplicationScoped = s.deduplicationScoped;
    row.createdAt = s.createdAt;
    return row;
  }
}
