import { AggregateRoot } from '../shared/aggregate-root';
import { BusinessRuleViolationError, InvalidArgumentError } from '../shared/domain-error';
import { PrioritySchemeId } from '../shared/identifiers';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';
import { PriorityLevel } from '../value-objects/priority-level';
import { PriorityRule } from '../value-objects/priority-rule';

const MAX_LEVELS = 20;
const MAX_RULES = 200;

export interface PrioritySchemeProps {
  name: string;
  levels: PriorityLevel[];
  rules: PriorityRule[];
  defaultLevelKey: string;
  active: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePrioritySchemeInput {
  name: string;
  levels: PriorityLevel[];
  defaultLevelKey: string;
  rules?: PriorityRule[];
  active?: boolean;
  now: Date;
}

export interface RevisePrioritySchemeInput {
  name?: string;
  levels?: PriorityLevel[];
  rules?: PriorityRule[];
  defaultLevelKey?: string;
  active?: boolean;
}

/**
 * The single, per-deployment configuration that turns findings into
 * customer-defined priorities. Owns an ordered set of {@link PriorityLevel}s, an
 * ordered list of {@link PriorityRule}s (evaluation order), and a mandatory default
 * level for findings that no rule matches.
 *
 * A monotonic {@link version} is bumped on every {@link revise}; findings store the
 * version that produced their assignment, so a revision can trigger a background
 * re-evaluation of anything now stale. Aggregate root — the consistency boundary
 * that guarantees rules only reference levels that exist and that keys/ranks stay
 * unique.
 */
export class PriorityScheme extends AggregateRoot<PrioritySchemeProps> {
  public static readonly MAX_LEVELS = MAX_LEVELS;
  public static readonly MAX_RULES = MAX_RULES;

  private constructor(props: PrioritySchemeProps, id: PrioritySchemeId) {
    super(props, id);
  }

  public static create(input: CreatePrioritySchemeInput, id: PrioritySchemeId): PriorityScheme {
    const name = parse(nonEmptyString, input.name, 'Scheme name');
    const rules = input.rules ?? [];
    PriorityScheme.validateConsistency(input.levels, rules, input.defaultLevelKey);
    const scheme = new PriorityScheme(
      {
        name,
        levels: input.levels,
        rules,
        defaultLevelKey: input.defaultLevelKey,
        active: input.active ?? true,
        version: 1,
        createdAt: input.now,
        updatedAt: input.now,
      },
      id,
    );
    scheme.addDomainEvent({ eventName: 'priority-scheme.created', aggregateId: id, occurredAt: input.now });
    return scheme;
  }

  public static reconstitute(props: PrioritySchemeProps, id: PrioritySchemeId): PriorityScheme {
    return new PriorityScheme(props, id);
  }

  // --- Getters -------------------------------------------------------------

  public get name(): string {
    return this.props.name;
  }

  public get version(): number {
    return this.props.version;
  }

  public get active(): boolean {
    return this.props.active;
  }

  public get defaultLevelKey(): string {
    return this.props.defaultLevelKey;
  }

  public get levels(): readonly PriorityLevel[] {
    return this.props.levels;
  }

  public get rules(): readonly PriorityRule[] {
    return this.props.rules;
  }

  public levelByKey(key: string): PriorityLevel {
    const level = this.props.levels.find((candidate) => candidate.key === key);
    if (!level) {
      throw new BusinessRuleViolationError(`No priority level with key "${key}".`);
    }
    return level;
  }

  public defaultLevel(): PriorityLevel {
    return this.levelByKey(this.props.defaultLevelKey);
  }

  // --- Mutation ------------------------------------------------------------

  /**
   * Replace part or all of the scheme's definition in one atomic, re-validated
   * revision, bumping {@link version}. The single edit entry point: a customer
   * editing their scheme is one revision, keeping version churn minimal.
   */
  public revise(input: RevisePrioritySchemeInput, now: Date): void {
    const name = input.name === undefined ? this.props.name : parse(nonEmptyString, input.name, 'Scheme name');
    const levels = input.levels ?? this.props.levels;
    const rules = input.rules ?? this.props.rules;
    const defaultLevelKey = input.defaultLevelKey ?? this.props.defaultLevelKey;
    PriorityScheme.validateConsistency(levels, rules, defaultLevelKey);

    this.props.name = name;
    this.props.levels = levels;
    this.props.rules = rules;
    this.props.defaultLevelKey = defaultLevelKey;
    if (input.active !== undefined) {
      this.props.active = input.active;
    }
    this.props.version += 1;
    this.props.updatedAt = now;
    this.addDomainEvent({ eventName: 'priority-scheme.revised', aggregateId: this.id, occurredAt: now });
  }

  public activate(now: Date): void {
    if (this.props.active) {
      return;
    }
    this.props.active = true;
    this.props.updatedAt = now;
    this.addDomainEvent({ eventName: 'priority-scheme.activated', aggregateId: this.id, occurredAt: now });
  }

  public deactivate(now: Date): void {
    if (!this.props.active) {
      return;
    }
    this.props.active = false;
    this.props.updatedAt = now;
    this.addDomainEvent({ eventName: 'priority-scheme.deactivated', aggregateId: this.id, occurredAt: now });
  }

  // --- Invariants ----------------------------------------------------------

  private static validateConsistency(
    levels: readonly PriorityLevel[],
    rules: readonly PriorityRule[],
    defaultLevelKey: string,
  ): void {
    if (levels.length === 0) {
      throw new InvalidArgumentError('A priority scheme needs at least one level.');
    }
    if (levels.length > MAX_LEVELS) {
      throw new InvalidArgumentError(`A priority scheme may define at most ${MAX_LEVELS} levels.`);
    }
    if (rules.length > MAX_RULES) {
      throw new InvalidArgumentError(`A priority scheme may define at most ${MAX_RULES} rules.`);
    }

    const levelKeys = new Set<string>();
    const ranks = new Set<number>();
    for (const level of levels) {
      if (levelKeys.has(level.key)) {
        throw new InvalidArgumentError(`Duplicate priority level key "${level.key}".`);
      }
      if (ranks.has(level.rank)) {
        throw new InvalidArgumentError(`Duplicate priority level rank ${level.rank}.`);
      }
      levelKeys.add(level.key);
      ranks.add(level.rank);
    }

    if (!levelKeys.has(defaultLevelKey)) {
      throw new InvalidArgumentError(`Default level "${defaultLevelKey}" is not one of the scheme's levels.`);
    }

    const ruleIds = new Set<string>();
    for (const rule of rules) {
      if (ruleIds.has(rule.id)) {
        throw new InvalidArgumentError(`Duplicate priority rule id "${rule.id}".`);
      }
      ruleIds.add(rule.id);
      if (!levelKeys.has(rule.levelKey)) {
        throw new InvalidArgumentError(`Rule "${rule.id}" targets unknown level "${rule.levelKey}".`);
      }
    }
  }
}
