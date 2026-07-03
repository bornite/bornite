import { Assessment } from '../entities/assessment';
import { AssessmentId } from '../shared/identifiers';
import { Repository } from './repository';

export type AssessmentRepository = Repository<Assessment, AssessmentId>;
