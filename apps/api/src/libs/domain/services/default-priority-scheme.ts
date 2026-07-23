import { ConditionOperator } from '../enums/condition-operator';
import { PriorityScheme } from '../entities/priority-scheme';
import { PrioritySchemeId } from '../shared/identifiers';
import { PriorityLevel } from '../value-objects/priority-level';
import { PriorityRule } from '../value-objects/priority-rule';
import { RuleCondition } from '../value-objects/rule-condition';

const riskAtLeast = (value: number): RuleCondition =>
  RuleCondition.tree({ type: 'compare', fact: 'finding.riskScore', op: ConditionOperator.GreaterThanOrEqual, value });

/**
 * A sensible out-of-the-box priority scheme so an unconfigured deployment still
 * gets meaningful priorities. It maps the existing risk-score bands (see
 * {@link RiskScore}) onto P0–P4 and promotes anything actively exploited to P0.
 * Deployments are expected to replace this via {@link RevisePriorityScheme}; the
 * rule set here is intentionally simple and transparent.
 */
export function buildDefaultPriorityScheme(id: PrioritySchemeId, now: Date): PriorityScheme {
  const levels = [
    PriorityLevel.of({ key: 'P0', label: 'Critical — act now', rank: 4, slaDays: 1, color: '#dc2626' }),
    PriorityLevel.of({ key: 'P1', label: 'High', rank: 3, slaDays: 7, color: '#ea580c' }),
    PriorityLevel.of({ key: 'P2', label: 'Medium', rank: 2, slaDays: 30, color: '#d97706' }),
    PriorityLevel.of({ key: 'P3', label: 'Low', rank: 1, slaDays: 90, color: '#65a30d' }),
    PriorityLevel.of({ key: 'P4', label: 'Informational', rank: 0, color: '#64748b' }),
  ];
  const rules = [
    PriorityRule.of({
      id: 'default-p0',
      name: 'Actively exploited or near-critical risk',
      levelKey: 'P0',
      condition: RuleCondition.tree({
        type: 'any',
        nodes: [
          { type: 'compare', fact: 'vuln.knownExploited', op: ConditionOperator.Equals, value: true },
          { type: 'compare', fact: 'finding.riskScore', op: ConditionOperator.GreaterThanOrEqual, value: 90 },
        ],
      }),
    }),
    PriorityRule.of({ id: 'default-p1', name: 'High risk', levelKey: 'P1', condition: riskAtLeast(70) }),
    PriorityRule.of({ id: 'default-p2', name: 'Medium risk', levelKey: 'P2', condition: riskAtLeast(40) }),
    PriorityRule.of({ id: 'default-p3', name: 'Low risk', levelKey: 'P3', condition: riskAtLeast(10) }),
  ];
  return PriorityScheme.create({ name: 'Default priority scheme', levels, rules, defaultLevelKey: 'P4', now }, id);
}
