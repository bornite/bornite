import { Repository as TypeOrmRepository } from 'typeorm';
import { Assessment, AssessmentRepository } from '../../../../libs/domain';
import { AssessmentEntity } from '../entities/assessment.entity';
import { AssessmentMapper } from '../mappers/assessment.mapper';
import { PostgresRepository } from './postgres.repository';

export class PostgresAssessmentRepository
  extends PostgresRepository<Assessment, AssessmentEntity>
  implements AssessmentRepository
{
  public constructor(repository: TypeOrmRepository<AssessmentEntity>) {
    super(repository, new AssessmentMapper());
  }
}
