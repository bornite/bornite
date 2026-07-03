import {
  Asset,
  AssetIdentifier,
  AssetRepository,
  CvssScore,
  CvssVector,
  Cwe,
  Finding,
  FindingFingerprintStrategy,
  FindingLocation,
  FindingRepository,
  ImportCounts,
  RiskScoringStrategy,
  ScanImport,
  Severity,
  Source,
  VulnerabilityDefinition,
  VulnerabilityDefinitionRepository,
  VulnerabilityIdentifier,
} from '../../domain';
import { Clock } from '../ports/clock';
import { IdGenerator } from '../ports/id-generator';
import {
  NormalizedAsset,
  NormalizedFinding,
  NormalizedRecord,
  NormalizedVulnerability,
  ReconcileMode,
} from './connector';

export interface IngestParams {
  readonly source: Source;
  readonly scanImport: ScanImport;
  readonly assessmentId: string | null;
  readonly records: AsyncIterable<NormalizedRecord>;
  readonly reconcileMode: ReconcileMode;
}

/**
 * The shared, connector-agnostic half of ingestion. It turns a stream of
 * {@link NormalizedRecord}s into persisted `Asset` / `VulnerabilityDefinition` /
 * `Finding` aggregates, deduplicating via the fingerprint strategy, scoring via
 * the risk strategy, and — for `snapshot` connectors — resolving findings that
 * the scan no longer reports. One implementation serves every connector.
 */
export class IngestionService {
  public constructor(
    private readonly assets: AssetRepository,
    private readonly definitions: VulnerabilityDefinitionRepository,
    private readonly findings: FindingRepository,
    private readonly fingerprintStrategy: FindingFingerprintStrategy,
    private readonly riskScoring: RiskScoringStrategy,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  public async ingest(params: IngestParams): Promise<ImportCounts> {
    const { source, scanImport, assessmentId, records, reconcileMode } = params;
    const now = this.clock.now();
    const counts: ImportCounts = { created: 0, reactivated: 0, closed: 0, untouched: 0 };
    const seenByAsset = new Map<string, Set<string>>();

    for await (const record of records) {
      const asset = await this.resolveAsset(record.asset, now);
      asset.recordSeen(now);
      await this.assets.save(asset);

      const definition = await this.resolveDefinition(record.vulnerability, now);
      const candidate = this.buildFinding(record.finding, source, scanImport, assessmentId, asset, definition, now);

      const fingerprint = candidate.fingerprint;
      if (fingerprint === null) {
        throw new Error('Fingerprint was not assigned to the candidate finding.');
      }

      const existing = await this.findings.findByFingerprint(fingerprint, asset.id);
      let finding: Finding;
      if (existing === null) {
        this.score(candidate, definition, asset);
        await this.findings.save(candidate);
        finding = candidate;
        counts.created += 1;
      } else {
        const wasActive = existing.isActive();
        existing.recordRedetection(scanImport.id, now);
        this.score(existing, definition, asset);
        await this.findings.save(existing);
        finding = existing;
        if (!wasActive && existing.isActive()) {
          counts.reactivated += 1;
        } else {
          counts.untouched += 1;
        }
      }
      this.markSeen(seenByAsset, asset.id, finding.id);
    }

    if (reconcileMode === 'snapshot') {
      await this.resolveMissing(source, seenByAsset, now, counts);
    }
    return counts;
  }

  private async resolveAsset(input: NormalizedAsset, now: Date): Promise<Asset> {
    const identifiers = input.identifiers.map((i) => AssetIdentifier.create(i.kind, i.value));
    const existing = await this.assets.findByIdentifiers(identifiers);
    if (existing !== null) {
      for (const identifier of identifiers) {
        existing.addIdentifier(identifier);
      }
      return existing;
    }
    return Asset.create(
      { type: input.type, name: input.name, identifiers, criticality: input.criticality, now },
      this.ids.generate(),
    );
  }

  private async resolveDefinition(input: NormalizedVulnerability, now: Date): Promise<VulnerabilityDefinition> {
    if (input.identifiers.length === 0) {
      throw new Error('A normalized vulnerability must carry at least one identifier.');
    }
    const identifiers = input.identifiers.map((i) => VulnerabilityIdentifier.create(i.system, i.value));
    const existing = await this.definitions.findByIdentifier(identifiers[0]);
    if (existing !== null) {
      for (const identifier of identifiers) {
        existing.addIdentifier(identifier);
      }
      await this.definitions.save(existing);
      return existing;
    }
    const definition = VulnerabilityDefinition.create(
      {
        identifiers,
        title: input.title,
        baseSeverity: Severity.of(input.baseSeverity),
        description: input.description,
        cwes: (input.cwes ?? []).map((number) => Cwe.create(number)),
        cvss: input.cvssVector === undefined ? undefined : CvssVector.create(input.cvssVector, input.cvssScore),
        references: input.references === undefined ? undefined : [...input.references],
        now,
      },
      this.ids.generate(),
    );
    await this.definitions.save(definition);
    return definition;
  }

  private buildFinding(
    input: NormalizedFinding,
    source: Source,
    scanImport: ScanImport,
    assessmentId: string | null,
    asset: Asset,
    definition: VulnerabilityDefinition,
    now: Date,
  ): Finding {
    const finding = Finding.create(
      {
        assetId: asset.id,
        vulnerabilityDefinitionId: definition.id,
        sourceId: source.id,
        scanImportId: scanImport.id,
        assessmentId: assessmentId ?? undefined,
        title: input.title,
        severity: Severity.of(input.severity),
        confidence: input.confidence,
        location: input.location === undefined ? undefined : FindingLocation.create(input.location),
        uniqueIdFromTool: input.uniqueIdFromTool,
        vulnIdFromTool: input.vulnIdFromTool,
        now,
      },
      this.ids.generate(),
    );
    finding.assignFingerprint(this.fingerprintStrategy, {
      vulnerabilityIdentifiers: definition.canonicalIdentifiers(),
      cwe: definition.primaryCwe(),
    });
    return finding;
  }

  private score(finding: Finding, definition: VulnerabilityDefinition, asset: Asset): void {
    const baseScore = definition.cvss === null ? null : definition.cvss.baseScore;
    finding.applyRiskScore(this.riskScoring, {
      epss: definition.epss,
      cvssScore: baseScore === null ? null : CvssScore.of(baseScore),
      knownExploited: definition.knownExploited,
      assetCriticality: asset.criticality,
    });
  }

  private async resolveMissing(
    source: Source,
    seenByAsset: Map<string, Set<string>>,
    now: Date,
    counts: ImportCounts,
  ): Promise<void> {
    for (const [assetId, seen] of seenByAsset) {
      const findings = await this.findings.findByAsset(assetId);
      for (const finding of findings) {
        // Only close this source's still-active findings that this scan omitted.
        if (finding.sourceId === source.id && finding.isActive() && !seen.has(finding.id)) {
          finding.resolve(now);
          await this.findings.save(finding);
          counts.closed += 1;
        }
      }
    }
  }

  private markSeen(map: Map<string, Set<string>>, assetId: string, findingId: string): void {
    const set = map.get(assetId) ?? new Set<string>();
    set.add(findingId);
    map.set(assetId, set);
  }
}
