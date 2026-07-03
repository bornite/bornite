import { ScanImportStatus } from '../enums/scan-import-status';
import { AggregateRoot } from '../shared/aggregate-root';
import { AssessmentId, ScanImportId, SourceId } from '../shared/identifiers';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';

/**
 * Reconciliation tally for one import, covering the reconciliation actions
 * (created / reactivated / closed / untouched).
 */
export interface ImportCounts {
  created: number;
  reactivated: number;
  closed: number;
  untouched: number;
}

export interface ScanImportProps {
  sourceId: SourceId;
  assessmentId: AssessmentId | null;
  status: ScanImportStatus;
  scanType: string;
  fileName: string | null;
  /** When the scan actually ran, per the tool (may predate ingestion). */
  reportedAt: Date | null;
  importedAt: Date;
  counts: ImportCounts | null;
  errorMessage: string | null;
}

export interface CreateScanImportInput {
  sourceId: SourceId;
  scanType: string;
  assessmentId?: AssessmentId;
  fileName?: string;
  reportedAt?: Date;
  now: Date;
}

/**
 * The ingestion of one scan result-set (a file upload or API pull) — provenance
 * for the findings it produced. It unifies the scan-run and import-record concepts.
 * Every {@link Finding} records the scan import that first created it and the one
 * that last confirmed it.
 *
 * Aggregate root.
 */
export class ScanImport extends AggregateRoot<ScanImportProps> {
  private constructor(props: ScanImportProps, id: ScanImportId) {
    super(props, id);
  }

  public static create(input: CreateScanImportInput, id: ScanImportId): ScanImport {
    return new ScanImport(
      {
        sourceId: input.sourceId,
        assessmentId: input.assessmentId ?? null,
        status: ScanImportStatus.Pending,
        scanType: parse(nonEmptyString, input.scanType, 'Scan type'),
        fileName: input.fileName?.trim() || null,
        reportedAt: input.reportedAt ?? null,
        importedAt: input.now,
        counts: null,
        errorMessage: null,
      },
      id,
    );
  }

  public static reconstitute(props: ScanImportProps, id: ScanImportId): ScanImport {
    return new ScanImport(props, id);
  }

  public get sourceId(): SourceId {
    return this.props.sourceId;
  }

  public get assessmentId(): AssessmentId | null {
    return this.props.assessmentId;
  }

  public get status(): ScanImportStatus {
    return this.props.status;
  }

  public get counts(): Readonly<ImportCounts> | null {
    return this.props.counts;
  }

  public beginProcessing(): void {
    this.props.status = ScanImportStatus.Processing;
  }

  public complete(counts: ImportCounts): void {
    this.props.status = ScanImportStatus.Completed;
    this.props.counts = counts;
    this.props.errorMessage = null;
  }

  public fail(message: string): void {
    this.props.status = ScanImportStatus.Failed;
    this.props.errorMessage = message;
  }

  public get total(): number {
    const c = this.props.counts;
    return c ? c.created + c.reactivated + c.closed + c.untouched : 0;
  }
}
