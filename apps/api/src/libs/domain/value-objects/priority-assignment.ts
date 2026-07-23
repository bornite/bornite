import { z } from 'zod';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';
import { ValueObject } from '../shared/value-object';

const rankSchema = z.number().int().min(0);
const versionSchema = z.number().int().min(1);

export interface PriorityAssignmentInput {
  levelKey: string;
  rank: number;
  matchedRuleId: string | null;
  schemeVersion: number;
  evaluatedAt: Date;
}

/**
 * The outcome of evaluating a {@link PriorityScheme} against one finding: which
 * level it landed in, that level's {@link rank} (denormalised so the worklist can
 * sort without touching the scheme), the {@link matchedRuleId} that decided it
 * (null = the scheme's default level), and the {@link schemeVersion} /
 * {@link evaluatedAt} that produced it — so a scheme revision can detect and
 * re-evaluate anything now stale. Stored on the {@link Finding}.
 */
export class PriorityAssignment extends ValueObject {
  private constructor(
    public readonly levelKey: string,
    public readonly rank: number,
    public readonly matchedRuleId: string | null,
    public readonly schemeVersion: number,
    public readonly evaluatedAt: Date,
  ) {
    super();
    Object.freeze(this);
  }

  public static of(input: PriorityAssignmentInput): PriorityAssignment {
    return new PriorityAssignment(
      parse(nonEmptyString, input.levelKey, 'Priority level key'),
      parse(rankSchema, input.rank, 'Priority rank'),
      input.matchedRuleId === null ? null : parse(nonEmptyString, input.matchedRuleId, 'Matched rule id'),
      parse(versionSchema, input.schemeVersion, 'Scheme version'),
      input.evaluatedAt,
    );
  }

  /** Whether the finding fell through to the scheme's default level. */
  public get matchedDefault(): boolean {
    return this.matchedRuleId === null;
  }

  /** True if produced by an older scheme version than `version` (needs re-evaluation). */
  public isStale(version: number): boolean {
    return this.schemeVersion < version;
  }
}
