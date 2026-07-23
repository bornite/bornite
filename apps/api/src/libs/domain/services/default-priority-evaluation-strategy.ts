import type { PriorityScheme } from '../entities/priority-scheme';
import type { FindingFacts } from '../value-objects/finding-facts';
import type { PriorityDecision, PriorityEvaluationStrategy } from './priority-evaluation-strategy';

/**
 * The reference priority strategy: walk the scheme's rules in order and assign the
 * level of the FIRST enabled rule whose condition matches — the semantics chosen for
 * bornite (predictable, short-circuiting, firewall-style). If no rule matches, fall
 * back to the scheme's mandatory default level.
 *
 * Evaluation is O(rules) with short-circuit over a flat facts object, so per-finding
 * cost is negligible; the engine is meant to run on write (at ingestion / on scheme
 * revision), never on the read path.
 */
export class DefaultPriorityEvaluationStrategy implements PriorityEvaluationStrategy {
  public evaluate(scheme: PriorityScheme, facts: FindingFacts): PriorityDecision {
    for (const rule of scheme.rules) {
      if (rule.matches(facts)) {
        const level = scheme.levelByKey(rule.levelKey);
        return { levelKey: level.key, rank: level.rank, matchedRuleId: rule.id };
      }
    }
    const fallback = scheme.defaultLevel();
    return { levelKey: fallback.key, rank: fallback.rank, matchedRuleId: null };
  }
}
