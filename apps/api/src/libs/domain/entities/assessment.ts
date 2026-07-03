import { AssessmentStatus } from '../enums/assessment-status';
import { AggregateRoot } from '../shared/aggregate-root';
import { IllegalStateTransitionError } from '../shared/domain-error';
import { AssessmentId } from '../shared/identifiers';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';

export interface AssessmentProps {
  name: string;
  description: string | null;
  status: AssessmentStatus;
  plannedStart: Date;
  plannedEnd: Date | null;
  actualStart: Date | null;
  actualEnd: Date | null;
  /** When true, finding deduplication is scoped to this assessment only. */
  deduplicationScoped: boolean;
  createdAt: Date;
}

export interface CreateAssessmentInput {
  name: string;
  plannedStart: Date;
  description?: string;
  plannedEnd?: Date;
  deduplicationScoped?: boolean;
  now: Date;
}

/**
 * A scoped body of scanning work (an "engagement" in some tools). Groups
 * {@link ScanImport}s (and, through them, findings) into a campaign with a
 * lifecycle and time window. The `deduplicationScoped` flag is a deliberate dedup
 * seam: deduplicate findings within this assessment only, or globally.
 *
 * Aggregate root. Scan imports reference an assessment by id.
 */
export class Assessment extends AggregateRoot<AssessmentProps> {
  private constructor(props: AssessmentProps, id: AssessmentId) {
    super(props, id);
  }

  public static create(input: CreateAssessmentInput, id: AssessmentId): Assessment {
    return new Assessment(
      {
        name: parse(nonEmptyString, input.name, 'Assessment name'),
        description: input.description?.trim() || null,
        status: AssessmentStatus.Planned,
        plannedStart: input.plannedStart,
        plannedEnd: input.plannedEnd ?? null,
        actualStart: null,
        actualEnd: null,
        deduplicationScoped: input.deduplicationScoped ?? false,
        createdAt: input.now,
      },
      id,
    );
  }

  public static reconstitute(props: AssessmentProps, id: AssessmentId): Assessment {
    return new Assessment(props, id);
  }

  public get name(): string {
    return this.props.name;
  }

  public get status(): AssessmentStatus {
    return this.props.status;
  }

  public get deduplicationScoped(): boolean {
    return this.props.deduplicationScoped;
  }

  public isOpen(): boolean {
    return this.props.status === AssessmentStatus.InProgress || this.props.status === AssessmentStatus.OnHold;
  }

  public start(at: Date): void {
    this.ensureNotTerminal();
    this.props.status = AssessmentStatus.InProgress;
    this.props.actualStart ??= at;
  }

  public hold(): void {
    if (this.props.status !== AssessmentStatus.InProgress) {
      throw new IllegalStateTransitionError('Only an in-progress assessment can be put on hold.');
    }
    this.props.status = AssessmentStatus.OnHold;
  }

  public complete(at: Date): void {
    this.ensureNotTerminal();
    this.props.status = AssessmentStatus.Completed;
    this.props.actualEnd = at;
  }

  public cancel(): void {
    this.ensureNotTerminal();
    this.props.status = AssessmentStatus.Cancelled;
  }

  private ensureNotTerminal(): void {
    if (
      this.props.status === AssessmentStatus.Completed ||
      this.props.status === AssessmentStatus.Cancelled
    ) {
      throw new IllegalStateTransitionError(
        `Assessment is already ${this.props.status} and cannot change state.`,
      );
    }
  }
}
