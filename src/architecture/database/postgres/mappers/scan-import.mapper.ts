import { ScanImport } from '../../../../libs/domain';
import { ScanImportEntity } from '../entities/scan-import.entity';
import { Mapper } from './mapper';

export class ScanImportMapper implements Mapper<ScanImport, ScanImportEntity> {
  public toDomain(row: ScanImportEntity): ScanImport {
    return ScanImport.reconstitute(
      {
        sourceId: row.sourceId,
        assessmentId: row.assessmentId,
        status: row.status,
        scanType: row.scanType,
        fileName: row.fileName,
        reportedAt: row.reportedAt,
        importedAt: row.importedAt,
        counts: row.counts === null ? null : { ...row.counts },
        errorMessage: row.errorMessage,
      },
      row.id,
    );
  }

  public toOrm(scanImport: ScanImport): ScanImportEntity {
    const s = scanImport.snapshot();
    const row = new ScanImportEntity();
    row.id = scanImport.id;
    row.sourceId = s.sourceId;
    row.assessmentId = s.assessmentId;
    row.status = s.status;
    row.scanType = s.scanType;
    row.fileName = s.fileName;
    row.reportedAt = s.reportedAt;
    row.importedAt = s.importedAt;
    row.counts = s.counts === null ? null : { ...s.counts };
    row.errorMessage = s.errorMessage;
    return row;
  }
}
