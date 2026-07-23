import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';
import { ValueObject } from '../shared/value-object';
import { FindingFacts } from './finding-facts';
import { RuleCondition } from './rule-condition';

export interface PriorityRuleInput {
  id: string;
  name: string;
  levelKey: string;
  condition: RuleCondition;
  enabled?: boolean;
}

/**
 * A single "if the condition holds, assign this level" rule. Rules live in an
 * ordered list on the {@link PriorityScheme}; the evaluation strategy walks them in
 * order. Carries a stable {@link id} so a finding can record which rule decided its
 * priority (explainability) and so the UI can reorder rules without ambiguity.
 */
export class PriorityRule extends ValueObject {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly levelKey: string,
    public readonly condition: RuleCondition,
    public readonly enabled: boolean,
  ) {
    super();
    Object.freeze(this);
  }

  public static of(input: PriorityRuleInput): PriorityRule {
    return new PriorityRule(
      parse(nonEmptyString, input.id, 'Priority rule id'),
      parse(nonEmptyString, input.name, 'Priority rule name'),
      parse(nonEmptyString, input.levelKey, 'Priority rule level'),
      input.condition,
      input.enabled ?? true,
    );
  }

  /** True when the rule is enabled and its condition matches the given facts. */
  public matches(facts: FindingFacts): boolean {
    return this.enabled && this.condition.evaluate(facts);
  }
}
