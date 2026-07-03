import { FindingGroupBy } from '../enums/finding-group-by';
import { AggregateRoot } from '../shared/aggregate-root';
import { AssessmentId, FindingGroupId, FindingId } from '../shared/identifiers';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';

export interface FindingGroupProps {
  name: string;
  groupBy: FindingGroupBy;
  assessmentId: AssessmentId | null;
  memberFindingIds: FindingId[];
  createdAt: Date;
}

export interface CreateFindingGroupInput {
  name: string;
  groupBy: FindingGroupBy;
  assessmentId?: AssessmentId;
  memberFindingIds?: FindingId[];
  now: Date;
}

/**
 * A named cluster of related findings (e.g. every finding for one vulnerable
 * component, or one CVE) handled together — bulk triage, a single ticket.
 *
 * Aggregate root that references its members by id. Roll-ups such as the group's
 * severity are computed by the application from the loaded members, not stored
 * here, to avoid a second source of truth.
 */
export class FindingGroup extends AggregateRoot<FindingGroupProps> {
  private constructor(props: FindingGroupProps, id: FindingGroupId) {
    super(props, id);
  }

  public static create(input: CreateFindingGroupInput, id: FindingGroupId): FindingGroup {
    return new FindingGroup(
      {
        name: parse(nonEmptyString, input.name, 'Finding group name'),
        groupBy: input.groupBy,
        assessmentId: input.assessmentId ?? null,
        memberFindingIds: input.memberFindingIds ? [...new Set(input.memberFindingIds)] : [],
        createdAt: input.now,
      },
      id,
    );
  }

  public static reconstitute(props: FindingGroupProps, id: FindingGroupId): FindingGroup {
    return new FindingGroup(props, id);
  }

  public get name(): string {
    return this.props.name;
  }

  public get groupBy(): FindingGroupBy {
    return this.props.groupBy;
  }

  public get memberFindingIds(): readonly FindingId[] {
    return this.props.memberFindingIds;
  }

  public get size(): number {
    return this.props.memberFindingIds.length;
  }

  public has(findingId: FindingId): boolean {
    return this.props.memberFindingIds.includes(findingId);
  }

  public add(findingId: FindingId): void {
    if (!this.has(findingId)) {
      this.props.memberFindingIds.push(findingId);
    }
  }

  public remove(findingId: FindingId): void {
    this.props.memberFindingIds = this.props.memberFindingIds.filter((id) => id !== findingId);
  }

  public isEmpty(): boolean {
    return this.props.memberFindingIds.length === 0;
  }
}
