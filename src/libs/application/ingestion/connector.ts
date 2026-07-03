import {
  AssetCriticality,
  AssetIdentifierKind,
  AssetType,
  ConfidenceLevel,
  SeverityLevel,
  SourceType,
  VulnerabilitySystem,
} from '../../domain';

/** How a connector obtains data. */
export enum CollectionMode {
  /** Poll the vendor on a schedule (most API scanners). */
  Pull = 'PULL',
  /** Receive data pushed to us: a file upload or a webhook. */
  Push = 'PUSH',
}

/**
 * How ingestion reconciles a batch against existing findings:
 * - `snapshot`: the batch is the full current state for its scope, so findings
 *   previously open but absent from the batch are auto-resolved (e.g. an SCA
 *   project scan).
 * - `upsert`: the batch is a set of events; only create/update, never close.
 */
export type ReconcileMode = 'snapshot' | 'upsert';

export interface NormalizedIdentifier<TKind> {
  readonly kind: TKind;
  readonly value: string;
}

/** The asset a finding was observed on, as produced by a connector's normaliser. */
export interface NormalizedAsset {
  readonly type: AssetType;
  readonly name: string;
  readonly identifiers: ReadonlyArray<NormalizedIdentifier<AssetIdentifierKind>>;
  readonly criticality?: AssetCriticality;
}

/** The vulnerability (catalog entry) a finding refers to. */
export interface NormalizedVulnerability {
  readonly identifiers: ReadonlyArray<{ readonly system: VulnerabilitySystem; readonly value: string }>;
  readonly title: string;
  readonly baseSeverity: SeverityLevel;
  readonly description?: string;
  readonly cwes?: readonly number[];
  readonly cvssVector?: string;
  readonly cvssScore?: number;
  readonly references?: readonly string[];
}

/** Where on the asset the finding sits (code-oriented for now; DAST can extend). */
export interface NormalizedLocation {
  readonly filePath?: string;
  readonly line?: number;
  readonly symbol?: string;
}

/** The occurrence itself. */
export interface NormalizedFinding {
  readonly title: string;
  readonly severity: SeverityLevel;
  readonly confidence?: ConfidenceLevel;
  readonly uniqueIdFromTool?: string;
  readonly vulnIdFromTool?: string;
  readonly location?: NormalizedLocation;
}

/**
 * The connector <-> ingestion contract: one normalized detection. Only the
 * connector's collect + normalize stages produce these; the shared ingestion
 * pipeline turns them into `Asset` / `VulnerabilityDefinition` / `Finding`.
 */
export interface NormalizedRecord {
  readonly asset: NormalizedAsset;
  readonly vulnerability: NormalizedVulnerability;
  readonly finding: NormalizedFinding;
}

/** Everything a connector needs for one sync run. */
export interface SyncContext {
  readonly sourceId: string;
  /** Connector-specific settings/credentials (validated by the connector). */
  readonly config: Readonly<Record<string, unknown>>;
  /** Opaque, connector-defined incremental cursor from the previous run. */
  readonly cursor: string | null;
  readonly signal?: AbortSignal;
}

/**
 * An integration with an external scanner/tool. Implementations live in the
 * infrastructure layer; the application depends only on this port. A connector's
 * whole job is to yield a stream of {@link NormalizedRecord}s — the generic
 * pipeline does dedup, scoring, persistence and reconciliation.
 */
export interface Connector {
  readonly key: string;
  readonly sourceType: SourceType;
  readonly modes: readonly CollectionMode[];
  readonly reconcileMode: ReconcileMode;
  sync(context: SyncContext): AsyncIterable<NormalizedRecord>;
}
