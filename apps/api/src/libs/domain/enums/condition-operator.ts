/**
 * The fixed, whitelisted vocabulary of comparison operators a priority-rule leaf
 * may use. Kept small and closed on purpose: a finite operator set (paired with
 * the finite {@link FACT_CATALOG}) is what keeps rule evaluation safe, fast and
 * fully data-driven — no expression to parse, no code to execute.
 */
export enum ConditionOperator {
  /** Scalar equality. */
  Equals = 'eq',
  /** Scalar inequality. */
  NotEquals = 'neq',
  /** Numeric greater-than. */
  GreaterThan = 'gt',
  /** Numeric greater-than-or-equal. */
  GreaterThanOrEqual = 'gte',
  /** Numeric less-than. */
  LessThan = 'lt',
  /** Numeric less-than-or-equal. */
  LessThanOrEqual = 'lte',
  /** Membership: the fact equals one of the supplied values. */
  In = 'in',
  /** Negated membership. */
  NotIn = 'nin',
  /** The fact (an array) includes the value, or (a string) contains the substring. */
  Contains = 'contains',
  /** Negated {@link Contains}. */
  NotContains = 'ncontains',
  /** Presence: value `true` requires the fact to be non-null, `false` requires null. */
  Exists = 'exists',
}
