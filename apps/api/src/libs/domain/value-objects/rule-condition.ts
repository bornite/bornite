import { z } from 'zod';
import { ConditionOperator } from '../enums/condition-operator';
import { BusinessRuleViolationError, InvalidArgumentError } from '../shared/domain-error';
import { parse } from '../shared/parse';
import { ValueObject } from '../shared/value-object';
import { FACT_CATALOG, FactDescriptor, FactKey, FactType, FactValue, FindingFacts } from './finding-facts';

// --- The AST ---------------------------------------------------------------

/** A node in a validated condition tree (leaf facts are known {@link FactKey}s). */
export type ConditionNode =
  | { readonly type: 'all'; readonly nodes: readonly ConditionNode[] }
  | { readonly type: 'any'; readonly nodes: readonly ConditionNode[] }
  | { readonly type: 'not'; readonly node: ConditionNode }
  | { readonly type: 'compare'; readonly fact: FactKey; readonly op: ConditionOperator; readonly value: FactValue };

/**
 * The serialisable payload of a condition. The `kind` discriminator is the
 * extension seam: `tree` is implemented today; `expr` (a CEL expression) is
 * reserved so a future power-user format can be added without touching storage,
 * the aggregate, or the evaluation loop.
 */
export type RuleConditionData =
  | { readonly kind: 'tree'; readonly root: ConditionNode }
  | { readonly kind: 'expr'; readonly language: 'cel'; readonly source: string };

// The pre-validation shape (leaf `fact` is a bare string until checked against the
// catalog), used purely to type the Zod parse result.
type RawNode =
  | { type: 'all'; nodes: RawNode[] }
  | { type: 'any'; nodes: RawNode[] }
  | { type: 'not'; node: RawNode }
  | { type: 'compare'; fact: string; op: ConditionOperator; value: FactValue };

type RawData =
  | { kind: 'tree'; root: RawNode }
  | { kind: 'expr'; language: 'cel'; source: string };

// --- Structural (Zod) validation ------------------------------------------

const valueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.string()),
  z.array(z.number()),
]);

const nodeSchema: z.ZodType<RawNode> = z.lazy(() =>
  z.union([
    z.object({ type: z.literal('all'), nodes: z.array(nodeSchema) }),
    z.object({ type: z.literal('any'), nodes: z.array(nodeSchema) }),
    z.object({ type: z.literal('not'), node: nodeSchema }),
    z.object({
      type: z.literal('compare'),
      fact: z.string(),
      op: z.nativeEnum(ConditionOperator),
      value: valueSchema,
    }),
  ]),
);

const dataSchema: z.ZodType<RawData> = z.union([
  z.object({ kind: z.literal('tree'), root: nodeSchema }),
  z.object({ kind: z.literal('expr'), language: z.literal('cel'), source: z.string().min(1) }),
]);

// --- Bounds & semantic validation -----------------------------------------

const MAX_DEPTH = 6;
const MAX_NODES = 100;

function assertNever(value: never): never {
  throw new InvalidArgumentError(`Unexpected rule-condition value: ${JSON.stringify(value)}`);
}

function toArray(value: FactValue): readonly unknown[] | null {
  return Array.isArray(value) ? value : null;
}

function inArray(actual: FactValue, value: FactValue): boolean {
  const options = toArray(value);
  return options !== null && options.some((candidate) => candidate === actual);
}

function scalarIsType(type: FactType, value: unknown): boolean {
  switch (type) {
    case 'number':
    case 'number[]':
      return typeof value === 'number';
    case 'string':
    case 'enum':
    case 'string[]':
      return typeof value === 'string';
    case 'boolean':
      return typeof value === 'boolean';
    default:
      return assertNever(type);
  }
}

function assertEnumMember(label: string, descriptor: FactDescriptor, value: unknown): void {
  if (descriptor.enumValues && (typeof value !== 'string' || !descriptor.enumValues.includes(value))) {
    throw new InvalidArgumentError(`${label}: "${String(value)}" is not one of ${descriptor.enumValues.join(', ')}.`);
  }
}

function assertLeafValue(fact: string, descriptor: FactDescriptor, op: ConditionOperator, value: FactValue): void {
  const label = `Fact "${fact}"`;
  switch (op) {
    case ConditionOperator.Exists:
      if (typeof value !== 'boolean') {
        throw new InvalidArgumentError(`${label}: the "exists" operator expects a boolean value.`);
      }
      return;
    case ConditionOperator.In:
    case ConditionOperator.NotIn: {
      const elements = toArray(value);
      if (elements === null) {
        throw new InvalidArgumentError(`${label}: the "${op}" operator expects an array of values.`);
      }
      for (const element of elements) {
        if (!scalarIsType(descriptor.type, element)) {
          throw new InvalidArgumentError(`${label}: "${op}" values must match the fact's type.`);
        }
        assertEnumMember(label, descriptor, element);
      }
      return;
    }
    case ConditionOperator.Contains:
    case ConditionOperator.NotContains:
      if (!scalarIsType(descriptor.type, value)) {
        throw new InvalidArgumentError(`${label}: "${op}" expects a single value matching the fact's element type.`);
      }
      return;
    case ConditionOperator.Equals:
    case ConditionOperator.NotEquals:
    case ConditionOperator.GreaterThan:
    case ConditionOperator.GreaterThanOrEqual:
    case ConditionOperator.LessThan:
    case ConditionOperator.LessThanOrEqual:
      if (!scalarIsType(descriptor.type, value)) {
        throw new InvalidArgumentError(`${label}: "${op}" expects a single value matching the fact's type.`);
      }
      assertEnumMember(label, descriptor, value);
      return;
    default:
      return assertNever(op);
  }
}

function assertLeaf(node: Extract<RawNode, { type: 'compare' }>): void {
  const descriptor = (FACT_CATALOG as Record<string, FactDescriptor | undefined>)[node.fact];
  if (!descriptor) {
    throw new InvalidArgumentError(`Unknown fact "${node.fact}".`);
  }
  if (!descriptor.operators.includes(node.op)) {
    throw new InvalidArgumentError(`Operator "${node.op}" is not allowed for fact "${node.fact}".`);
  }
  assertLeafValue(node.fact, descriptor, node.op, node.value);
}

function validateTree(root: RawNode): void {
  let count = 0;
  const walk = (node: RawNode, depth: number): void => {
    count += 1;
    if (count > MAX_NODES) {
      throw new InvalidArgumentError(`A rule condition may contain at most ${MAX_NODES} nodes.`);
    }
    if (depth > MAX_DEPTH) {
      throw new InvalidArgumentError(`A rule condition may nest at most ${MAX_DEPTH} levels deep.`);
    }
    switch (node.type) {
      case 'all':
      case 'any':
        if (node.nodes.length === 0) {
          throw new InvalidArgumentError(`An "${node.type}" group needs at least one child condition.`);
        }
        for (const child of node.nodes) {
          walk(child, depth + 1);
        }
        return;
      case 'not':
        walk(node.node, depth + 1);
        return;
      case 'compare':
        assertLeaf(node);
        return;
      default:
        return assertNever(node);
    }
  };
  walk(root, 1);
}

// --- Evaluation ------------------------------------------------------------

function evaluateNode(node: ConditionNode, facts: FindingFacts): boolean {
  switch (node.type) {
    case 'all':
      return node.nodes.every((child) => evaluateNode(child, facts));
    case 'any':
      return node.nodes.some((child) => evaluateNode(child, facts));
    case 'not':
      return !evaluateNode(node.node, facts);
    case 'compare':
      return evaluateCompare(node, facts);
    default:
      return assertNever(node);
  }
}

function evaluateCompare(node: Extract<ConditionNode, { type: 'compare' }>, facts: FindingFacts): boolean {
  const actual: FactValue = facts[node.fact];
  const { op, value } = node;
  switch (op) {
    case ConditionOperator.Exists: {
      const present = actual !== null && actual !== undefined;
      return value === true ? present : !present;
    }
    case ConditionOperator.Equals:
      return actual === value;
    case ConditionOperator.NotEquals:
      return actual !== value;
    case ConditionOperator.GreaterThan:
      return typeof actual === 'number' && typeof value === 'number' && actual > value;
    case ConditionOperator.GreaterThanOrEqual:
      return typeof actual === 'number' && typeof value === 'number' && actual >= value;
    case ConditionOperator.LessThan:
      return typeof actual === 'number' && typeof value === 'number' && actual < value;
    case ConditionOperator.LessThanOrEqual:
      return typeof actual === 'number' && typeof value === 'number' && actual <= value;
    case ConditionOperator.In:
      return inArray(actual, value);
    case ConditionOperator.NotIn:
      return !inArray(actual, value);
    case ConditionOperator.Contains:
      return containsValue(actual, value);
    case ConditionOperator.NotContains:
      return !containsValue(actual, value);
    default:
      return assertNever(op);
  }
}

function containsValue(actual: FactValue, value: FactValue): boolean {
  const elements = toArray(actual);
  if (elements !== null) {
    return elements.some((element) => element === value);
  }
  if (typeof actual === 'string' && typeof value === 'string') {
    return actual.includes(value);
  }
  return false;
}

// --- Value object ----------------------------------------------------------

/**
 * A serialisable boolean condition — the "if" half of a {@link PriorityRule}. As a
 * tree, `all`/`any`/`not` combinators nest over `compare` leaves
 * ({fact, operator, value}) drawn from the {@link FACT_CATALOG}. Nothing here
 * executes code, so evaluation is safe, fast and data-driven; depth and node count
 * are capped ({@link MAX_DEPTH}/{@link MAX_NODES}) so worst-case cost stays bounded.
 */
export class RuleCondition extends ValueObject {
  public static readonly MAX_DEPTH = MAX_DEPTH;
  public static readonly MAX_NODES = MAX_NODES;

  private constructor(public readonly data: RuleConditionData) {
    super();
    Object.freeze(this);
  }

  /** Build (and fully validate) from an untrusted, serialised condition. */
  public static fromData(input: unknown): RuleCondition {
    const data = parse(dataSchema, input, 'Rule condition');
    if (data.kind === 'expr') {
      throw new InvalidArgumentError('CEL expression conditions are not yet supported.');
    }
    validateTree(data.root);
    return new RuleCondition({ kind: 'tree', root: data.root as ConditionNode });
  }

  /** Convenience factory for a tree condition assembled in code. */
  public static tree(root: ConditionNode): RuleCondition {
    return RuleCondition.fromData({ kind: 'tree', root });
  }

  public get kind(): RuleConditionData['kind'] {
    return this.data.kind;
  }

  /** Evaluate the condition against one finding's facts. */
  public evaluate(facts: FindingFacts): boolean {
    if (this.data.kind !== 'tree') {
      throw new BusinessRuleViolationError('CEL expression conditions are not yet supported.');
    }
    return evaluateNode(this.data.root, facts);
  }
}
