import { ConfidenceLevel } from '../enums/confidence-level';
import { ACTIVE_STATUSES, FindingStatus } from '../enums/finding-status';
import {
  FindingFingerprintInput,
  FindingFingerprintStrategy,
} from '../services/finding-fingerprint-strategy';
import { RiskScoringContext, RiskScoringStrategy } from '../services/risk-scoring-strategy';
import { AggregateRoot } from '../shared/aggregate-root';
import { IllegalStateTransitionError } from '../shared/domain-error';
import {
  AssessmentId,
  AssetId,
  FindingId,
  RiskAcceptanceId,
  ScanImportId,
  SourceId,
  VulnerabilityDefinitionId,
} from '../shared/identifiers';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';
import { FindingFingerprint } from '../value-objects/finding-fingerprint';
import { FindingLocation } from '../value-objects/finding-location';
import { RiskScore } from '../value-objects/risk-score';
import { Severity } from '../value-objects/severity';

export interface FindingProps {
  // Cross-aggregate references (by id).
  assetId: AssetId;
  vulnerabilityDefinitionId: VulnerabilityDefinitionId;
  sourceId: SourceId;
  scanImportId: ScanImportId | null;
  assessmentId: AssessmentId | null;

  // Occurrence state.
  title: string;
  status: FindingStatus;
  severity: Severity;
  confidence: ConfidenceLevel | null;
  riskScore: RiskScore | null;
  location: FindingLocation | null;
  fingerprint: FindingFingerprint | null;

  // Source-supplied technical identifiers (dedup inputs).
  uniqueIdFromTool: string | null;
  vulnIdFromTool: string | null;

  // Lifecycle links.
  duplicateOfId: FindingId | null;
  riskAcceptanceId: RiskAcceptanceId | null;

  // Timestamps.
  firstDetectedAt: Date;
  lastDetectedAt: Date;
  statusChangedAt: Date;
  mitigatedAt: Date | null;
  createdAt: Date;
}

export interface CreateFindingInput {
  assetId: AssetId;
  vulnerabilityDefinitionId: VulnerabilityDefinitionId;
  sourceId: SourceId;
  title: string;
  severity: Severity;
  scanImportId?: ScanImportId;
  assessmentId?: AssessmentId;
  confidence?: ConfidenceLevel;
  location?: FindingLocation;
  uniqueIdFromTool?: string;
  vulnIdFromTool?: string;
  now: Date;
}

/** Catalog context a finding needs to build its deduplication fingerprint. */
export interface FindingDedupContext {
  vulnerabilityIdentifiers: readonly string[];
  cwe: number | null;
}

/**
 * The central aggregate: one occurrence of a {@link VulnerabilityDefinition}
 * detected on an {@link Asset} by a {@link Source}. Where legacy tools make a
 * `Finding` a god-object that also carries CVE/CVSS/EPSS catalog data and the asset
 * location, ours holds only the *occurrence* — status, contextual severity, risk
 * score, dedup key and provenance — and points at the catalog and asset by id.
 *
 * The finding is where the two engineered seams live:
 *  - **deduplication** — {@link assignFingerprint} delegates to a pluggable
 *    {@link FindingFingerprintStrategy};
 *  - **risk scoring** — {@link applyRiskScore} delegates to a pluggable
 *    {@link RiskScoringStrategy}.
 *
 * Lifecycle is a single {@link FindingStatus} with guarded transitions, replacing
 * the tangle of overlapping status booleans seen in legacy tools.
 */
export class Finding extends AggregateRoot<FindingProps> {
  private constructor(props: FindingProps, id: FindingId) {
    super(props, id);
  }

  public static create(input: CreateFindingInput, id: FindingId): Finding {
    const finding = new Finding(
      {
        assetId: input.assetId,
        vulnerabilityDefinitionId: input.vulnerabilityDefinitionId,
        sourceId: input.sourceId,
        scanImportId: input.scanImportId ?? null,
        assessmentId: input.assessmentId ?? null,
        title: parse(nonEmptyString, input.title, 'Finding title'),
        status: FindingStatus.Open,
        severity: input.severity,
        confidence: input.confidence ?? null,
        riskScore: null,
        location: input.location ?? null,
        fingerprint: null,
        uniqueIdFromTool: input.uniqueIdFromTool?.trim() || null,
        vulnIdFromTool: input.vulnIdFromTool?.trim() || null,
        duplicateOfId: null,
        riskAcceptanceId: null,
        firstDetectedAt: input.now,
        lastDetectedAt: input.now,
        statusChangedAt: input.now,
        mitigatedAt: null,
        createdAt: input.now,
      },
      id,
    );
    finding.addDomainEvent({ eventName: 'finding.detected', aggregateId: id, occurredAt: input.now });
    return finding;
  }

  public static reconstitute(props: FindingProps, id: FindingId): Finding {
    return new Finding(props, id);
  }

  // --- Getters -------------------------------------------------------------

  public get assetId(): AssetId {
    return this.props.assetId;
  }

  public get vulnerabilityDefinitionId(): VulnerabilityDefinitionId {
    return this.props.vulnerabilityDefinitionId;
  }

  public get sourceId(): SourceId {
    return this.props.sourceId;
  }

  public get title(): string {
    return this.props.title;
  }

  public get status(): FindingStatus {
    return this.props.status;
  }

  public get severity(): Severity {
    return this.props.severity;
  }

  public get confidence(): ConfidenceLevel | null {
    return this.props.confidence;
  }

  public get riskScore(): RiskScore | null {
    return this.props.riskScore;
  }

  public get location(): FindingLocation | null {
    return this.props.location;
  }

  public get fingerprint(): FindingFingerprint | null {
    return this.props.fingerprint;
  }

  public get uniqueIdFromTool(): string | null {
    return this.props.uniqueIdFromTool;
  }

  public get duplicateOfId(): FindingId | null {
    return this.props.duplicateOfId;
  }

  public get riskAcceptanceId(): RiskAcceptanceId | null {
    return this.props.riskAcceptanceId;
  }

  public get lastDetectedAt(): Date {
    return this.props.lastDetectedAt;
  }

  public isActive(): boolean {
    return ACTIVE_STATUSES.includes(this.props.status);
  }

  /** Deduplication key: fingerprint if computed, else the tool's unique id. */
  public dedupKey(): string | null {
    return this.props.fingerprint?.value ?? this.props.uniqueIdFromTool ?? null;
  }

  // --- Pluggable seams -----------------------------------------------------

  /**
   * (Re)compute this finding's deduplication fingerprint via an injected
   * strategy. Catalog-owned inputs (identifiers, CWE) are supplied via `context`.
   */
  public assignFingerprint(strategy: FindingFingerprintStrategy, context: FindingDedupContext): void {
    const input: FindingFingerprintInput = {
      assetId: this.props.assetId,
      vulnerabilityIdentifiers: context.vulnerabilityIdentifiers,
      cwe: context.cwe,
      title: this.props.title,
      locationDescriptor: this.props.location ? this.props.location.descriptor() : '',
      uniqueIdFromTool: this.props.uniqueIdFromTool,
    };
    this.props.fingerprint = strategy.fingerprint(input);
  }

  /**
   * (Re)compute this finding's risk score via an injected strategy. The finding
   * contributes its own severity/confidence; the rest of the factors (EPSS, CVSS,
   * KEV, asset criticality) are supplied via `context`.
   */
  public applyRiskScore(strategy: RiskScoringStrategy, context: RiskScoringContext): void {
    this.props.riskScore = strategy.score({
      severity: this.props.severity,
      confidence: this.props.confidence,
      ...context,
    });
  }

  public changeSeverity(severity: Severity): void {
    this.props.severity = severity;
  }

  // --- Lifecycle transitions ----------------------------------------------

  public confirm(at: Date): void {
    this.ensureFrom([FindingStatus.Open], 'confirm');
    this.changeStatus(FindingStatus.Confirmed, at, 'finding.confirmed');
  }

  public markFalsePositive(at: Date): void {
    this.ensureFrom(ACTIVE_STATUSES, 'mark as false positive');
    this.changeStatus(FindingStatus.FalsePositive, at, 'finding.false-positive');
  }

  public markOutOfScope(at: Date): void {
    this.ensureFrom(ACTIVE_STATUSES, 'mark out of scope');
    this.changeStatus(FindingStatus.OutOfScope, at, 'finding.out-of-scope');
  }

  public markDuplicateOf(originalId: FindingId, at: Date): void {
    if (originalId === this.id) {
      throw new IllegalStateTransitionError('A finding cannot be a duplicate of itself.');
    }
    this.props.duplicateOfId = originalId;
    this.changeStatus(FindingStatus.Duplicate, at, 'finding.duplicate');
  }

  public accept(riskAcceptanceId: RiskAcceptanceId, at: Date): void {
    this.ensureFrom([FindingStatus.Open, FindingStatus.Confirmed], 'accept the risk of');
    this.props.riskAcceptanceId = riskAcceptanceId;
    this.changeStatus(FindingStatus.RiskAccepted, at, 'finding.risk-accepted');
  }

  /** Undo a risk acceptance (e.g. on expiry), returning the finding to Open. */
  public releaseAcceptance(at: Date): void {
    this.ensureFrom([FindingStatus.RiskAccepted], 'release the acceptance of');
    this.props.riskAcceptanceId = null;
    this.changeStatus(FindingStatus.Open, at, 'finding.reopened');
  }

  public mitigate(at: Date): void {
    this.ensureFrom([FindingStatus.Open, FindingStatus.Confirmed, FindingStatus.RiskAccepted], 'mitigate');
    this.props.mitigatedAt = at;
    this.changeStatus(FindingStatus.Mitigated, at, 'finding.mitigated');
  }

  /** Close a finding no longer observed by any source. */
  public resolve(at: Date): void {
    if (this.props.status === FindingStatus.Resolved) {
      return;
    }
    this.changeStatus(FindingStatus.Resolved, at, 'finding.resolved');
  }

  public reopen(at: Date): void {
    this.ensureFrom(
      [
        FindingStatus.Mitigated,
        FindingStatus.Resolved,
        FindingStatus.FalsePositive,
        FindingStatus.OutOfScope,
      ],
      'reopen',
    );
    this.props.mitigatedAt = null;
    this.changeStatus(FindingStatus.Open, at, 'finding.reopened');
  }

  /**
   * Record that a later scan re-observed this finding. Advances `lastDetectedAt`
   * and, if the finding had been closed (mitigated/resolved), reopens it — the
   * regression-detection rule.
   */
  public recordRedetection(scanImportId: ScanImportId, at: Date): void {
    if (at.getTime() > this.props.lastDetectedAt.getTime()) {
      this.props.lastDetectedAt = at;
    }
    this.props.scanImportId = scanImportId;
    if (this.props.status === FindingStatus.Mitigated || this.props.status === FindingStatus.Resolved) {
      this.props.mitigatedAt = null;
      this.changeStatus(FindingStatus.Open, at, 'finding.reopened');
    }
  }

  // --- Internals -----------------------------------------------------------

  private changeStatus(to: FindingStatus, at: Date, eventName: string): void {
    this.props.status = to;
    this.props.statusChangedAt = at;
    this.addDomainEvent({ eventName, aggregateId: this.id, occurredAt: at });
  }

  private ensureFrom(allowed: readonly FindingStatus[], action: string): void {
    if (!allowed.includes(this.props.status)) {
      throw new IllegalStateTransitionError(
        `Cannot ${action} a finding in status ${this.props.status}.`,
      );
    }
  }
}
