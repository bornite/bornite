import { AssetCriticality } from '../enums/asset-criticality';
import { AssetType } from '../enums/asset-type';
import { ConditionOperator } from '../enums/condition-operator';
import { ConfidenceLevel } from '../enums/confidence-level';
import { FindingStatus } from '../enums/finding-status';
import { SeverityLevel } from '../enums/severity-level';

/** A single scalar a rule can compare against. */
export type FactScalar = string | number | boolean | null;

/** Any value a fact can hold — a scalar or a homogeneous array. */
export type FactValue = FactScalar | readonly string[] | readonly number[];

/**
 * The flat, whitelisted vocabulary of "facts" a priority rule may test. Assembled
 * once per finding by the application layer from the Finding, its
 * {@link VulnerabilityDefinition} and its {@link Asset}, then handed to the rule
 * evaluator.
 *
 * Keys are deliberately dotted, flat and finite: rules reference a fact by key
 * (never an entity's internals), lookups are O(1), and the closed set bounds both
 * evaluation cost and what a rule-builder UI has to offer. Add a fact by extending
 * this interface and {@link FACT_CATALOG} together — the two are kept in lock-step
 * by the `Record<FactKey, …>` type below.
 */
export interface FindingFacts {
  'finding.status': FindingStatus;
  'finding.confidence': ConfidenceLevel | null;
  'finding.riskScore': number | null;
  'finding.title': string;
  'severity.level': SeverityLevel;
  'severity.rank': number;
  'cvss.baseScore': number | null;
  'epss.probability': number | null;
  'epss.percentile': number | null;
  'vuln.knownExploited': boolean;
  'vuln.ransomware': boolean;
  'vuln.fixAvailable': boolean | null;
  'vuln.cve': string | null;
  'vuln.cwes': readonly number[];
  'asset.type': AssetType;
  'asset.criticality': AssetCriticality;
  'asset.criticalityWeight': number;
  'asset.tags': readonly string[];
}

/** A key into {@link FindingFacts} — the set of facts a rule may reference. */
export type FactKey = keyof FindingFacts;

/** The declared datatype of a fact, driving operator/value validation. */
export type FactType = 'number' | 'string' | 'boolean' | 'enum' | 'string[]' | 'number[]';

/** Metadata describing one fact: its type, nullability and legal operators. */
export interface FactDescriptor {
  readonly type: FactType;
  readonly nullable: boolean;
  readonly operators: readonly ConditionOperator[];
  /** For `enum` facts, the exhaustive set of legal values (validation + UI). */
  readonly enumValues?: readonly string[];
  readonly description: string;
}

const {
  Equals,
  NotEquals,
  GreaterThan,
  GreaterThanOrEqual,
  LessThan,
  LessThanOrEqual,
  In,
  NotIn,
  Contains,
  NotContains,
  Exists,
} = ConditionOperator;

const NUMERIC: readonly ConditionOperator[] = [
  Equals,
  NotEquals,
  GreaterThan,
  GreaterThanOrEqual,
  LessThan,
  LessThanOrEqual,
  In,
  NotIn,
];
const STRING: readonly ConditionOperator[] = [Equals, NotEquals, In, NotIn, Contains, NotContains];
const BOOLEAN: readonly ConditionOperator[] = [Equals, NotEquals];
const ENUM: readonly ConditionOperator[] = [Equals, NotEquals, In, NotIn];
const ARRAY: readonly ConditionOperator[] = [Contains, NotContains];

/** Append the `exists` operator for nullable facts. */
function ops(base: readonly ConditionOperator[], nullable: boolean): readonly ConditionOperator[] {
  return nullable ? [...base, Exists] : base;
}

/**
 * The single source of truth for what a rule may reference. Rule validation rejects
 * any leaf whose fact is absent here, whose operator is not listed, or whose value
 * does not match the fact's type — so a stored rule set is always well-formed.
 */
export const FACT_CATALOG: Readonly<Record<FactKey, FactDescriptor>> = {
  'finding.status': {
    type: 'enum',
    nullable: false,
    operators: ENUM,
    enumValues: Object.values(FindingStatus),
    description: 'Lifecycle state of the finding.',
  },
  'finding.confidence': {
    type: 'enum',
    nullable: true,
    operators: ops(ENUM, true),
    enumValues: Object.values(ConfidenceLevel),
    description: 'Source confidence that the finding is a true positive.',
  },
  'finding.riskScore': {
    type: 'number',
    nullable: true,
    operators: ops(NUMERIC, true),
    description: 'Computed 0–100 risk score, if the finding has been scored.',
  },
  'finding.title': {
    type: 'string',
    nullable: false,
    operators: STRING,
    description: 'Finding title.',
  },
  'severity.level': {
    type: 'enum',
    nullable: false,
    operators: ENUM,
    enumValues: Object.values(SeverityLevel),
    description: 'Qualitative severity band.',
  },
  'severity.rank': {
    type: 'number',
    nullable: false,
    operators: NUMERIC,
    description: 'Severity rank (0 Info … 4 Critical).',
  },
  'cvss.baseScore': {
    type: 'number',
    nullable: true,
    operators: ops(NUMERIC, true),
    description: 'CVSS base score 0.0–10.0, if known.',
  },
  'epss.probability': {
    type: 'number',
    nullable: true,
    operators: ops(NUMERIC, true),
    description: 'EPSS exploitation probability 0–1, if known.',
  },
  'epss.percentile': {
    type: 'number',
    nullable: true,
    operators: ops(NUMERIC, true),
    description: 'EPSS percentile 0–1, if known.',
  },
  'vuln.knownExploited': {
    type: 'boolean',
    nullable: false,
    operators: BOOLEAN,
    description: 'Listed in a known-exploited (KEV) catalog.',
  },
  'vuln.ransomware': {
    type: 'boolean',
    nullable: false,
    operators: BOOLEAN,
    description: 'Known to be used in ransomware campaigns.',
  },
  'vuln.fixAvailable': {
    type: 'boolean',
    nullable: true,
    operators: ops(BOOLEAN, true),
    description: 'A fix / patch is available, if known.',
  },
  'vuln.cve': {
    type: 'string',
    nullable: true,
    operators: ops(STRING, true),
    description: 'Primary CVE id, if any (e.g. CVE-2021-44228).',
  },
  'vuln.cwes': {
    type: 'number[]',
    nullable: false,
    operators: ARRAY,
    description: 'Associated CWE numbers.',
  },
  'asset.type': {
    type: 'enum',
    nullable: false,
    operators: ENUM,
    enumValues: Object.values(AssetType),
    description: 'Kind of asset (host, web app, container, …).',
  },
  'asset.criticality': {
    type: 'enum',
    nullable: false,
    operators: ENUM,
    enumValues: Object.values(AssetCriticality),
    description: 'Business criticality of the asset.',
  },
  'asset.criticalityWeight': {
    type: 'number',
    nullable: false,
    operators: NUMERIC,
    description: 'Normalised asset-criticality weight 0–1.',
  },
  'asset.tags': {
    type: 'string[]',
    nullable: false,
    operators: ARRAY,
    description: 'Free-form asset tags (e.g. "windows", "sensitive", "internet-facing").',
  },
};
