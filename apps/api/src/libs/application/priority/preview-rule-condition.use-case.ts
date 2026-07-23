import { FindingFacts, RuleCondition } from '../../domain';

export interface RuleConditionPreviewResult {
  readonly matches: boolean;
}

/**
 * Test a single (possibly unsaved) rule condition against a sample set of facts —
 * the "does this rule fire?" preview behind the rule builder. Building the
 * condition here validates it, so an invalid fact/operator/value surfaces as the
 * exact domain error (→ 400 at the edge), which is the most useful feedback while
 * authoring rules. Pure — no persistence.
 */
export class PreviewRuleCondition {
  public evaluate(conditionData: unknown, facts: Record<string, unknown>): RuleConditionPreviewResult {
    const condition = RuleCondition.fromData(conditionData);
    return { matches: condition.evaluate(facts as unknown as FindingFacts) };
  }
}
