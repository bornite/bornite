import { ScanImport } from '../entities/scan-import';
import { AssessmentId, ScanImportId } from '../shared/identifiers';
import { Repository } from './repository';

export interface ScanImportRepository extends Repository<ScanImport, ScanImportId> {
  findByAssessment(assessmentId: AssessmentId): Promise<ScanImport[]>;
}
