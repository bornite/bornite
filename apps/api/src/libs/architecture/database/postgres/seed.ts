import { DataSource } from 'typeorm';
import { Clock, IdGenerator } from '../../../application';
import {
  Asset,
  AssetCriticality,
  AssetIdentifier,
  AssetIdentifierKind,
  AssetType,
  Cwe,
  EpssScore,
  Finding,
  FindingStatus,
  RiskScore,
  Severity,
  SeverityLevel,
  Source,
  SourceType,
  VulnerabilityDefinition,
  VulnerabilityIdentifier,
  VulnerabilitySystem,
} from '../../../domain';
import { AssetEntity, FindingEntity, SourceEntity, VulnerabilityDefinitionEntity } from './entities';
import {
  PostgresAssetRepository,
  PostgresFindingRepository,
  PostgresSourceRepository,
  PostgresVulnerabilityDefinitionRepository,
} from './repositories';

interface SeedFinding {
  sourceName: string;
  sourceType: SourceType;
  assetName: string;
  assetType: AssetType;
  criticality: AssetCriticality;
  cve?: string;
  pluginId?: string;
  cwe?: number;
  title: string;
  severity: SeverityLevel;
  status: FindingStatus;
  riskScore: number;
  epss?: number;
  knownExploited: boolean;
  firstSeen: string;
  lastSeen: string;
}

const SEED: SeedFinding[] = [
  { sourceName: 'Checkmarx SCA', sourceType: SourceType.Sca, assetName: 'payments-api', assetType: AssetType.CodeRepository, criticality: AssetCriticality.High, cve: 'CVE-2021-44228', cwe: 502, title: 'Apache Log4j2 remote code execution (Log4Shell)', severity: SeverityLevel.Critical, status: FindingStatus.Open, riskScore: 98, epss: 0.975, knownExploited: true, firstSeen: '2026-06-18', lastSeen: '2026-07-02' },
  { sourceName: 'Trivy', sourceType: SourceType.ContainerScanner, assetName: 'checkout-service', assetType: AssetType.Container, criticality: AssetCriticality.High, cve: 'CVE-2022-22965', cwe: 94, title: 'Spring Framework RCE (Spring4Shell)', severity: SeverityLevel.Critical, status: FindingStatus.Confirmed, riskScore: 94, epss: 0.94, knownExploited: true, firstSeen: '2026-06-20', lastSeen: '2026-07-02' },
  { sourceName: 'Checkmarx SAST', sourceType: SourceType.Sast, assetName: 'payments-api', assetType: AssetType.CodeRepository, criticality: AssetCriticality.High, pluginId: 'cxsast:query:589', cwe: 89, title: 'SQL injection in order lookup', severity: SeverityLevel.High, status: FindingStatus.Open, riskScore: 82, knownExploited: false, firstSeen: '2026-06-28', lastSeen: '2026-07-02' },
  { sourceName: 'Prowler', sourceType: SourceType.Cspm, assetName: 'arn:aws:s3:::acme-public-assets', assetType: AssetType.CloudResource, criticality: AssetCriticality.Medium, pluginId: 'cspm:s3-public-read', title: 'S3 bucket publicly readable', severity: SeverityLevel.High, status: FindingStatus.RiskAccepted, riskScore: 66, knownExploited: false, firstSeen: '2026-04-11', lastSeen: '2026-07-02' },
  { sourceName: 'Tenable Nessus', sourceType: SourceType.NetworkScanner, assetName: 'edge-gateway-01', assetType: AssetType.Host, criticality: AssetCriticality.Medium, pluginId: 'nessus:104743', title: 'TLS 1.0/1.1 enabled', severity: SeverityLevel.Low, status: FindingStatus.Open, riskScore: 22, knownExploited: false, firstSeen: '2026-05-30', lastSeen: '2026-07-01' },
  { sourceName: 'OWASP ZAP', sourceType: SourceType.Dast, assetName: 'www.acme.example', assetType: AssetType.WebApplication, criticality: AssetCriticality.Low, pluginId: 'zap:10038', title: 'Missing HTTP security headers', severity: SeverityLevel.Low, status: FindingStatus.Mitigated, riskScore: 15, knownExploited: false, firstSeen: '2026-06-01', lastSeen: '2026-06-29' },
];

/** Populate the database with sample data on first boot (no-op if not empty). */
export async function seedIfEmpty(dataSource: DataSource, ids: IdGenerator, clock: Clock): Promise<void> {
  const findingOrm = dataSource.getRepository(FindingEntity);
  if ((await findingOrm.count()) > 0) {
    return;
  }

  const assets = new PostgresAssetRepository(dataSource.getRepository(AssetEntity));
  const definitions = new PostgresVulnerabilityDefinitionRepository(
    dataSource.getRepository(VulnerabilityDefinitionEntity),
  );
  const sources = new PostgresSourceRepository(dataSource.getRepository(SourceEntity));
  const findings = new PostgresFindingRepository(findingOrm);
  const now = clock.now();

  const sourceByName = new Map<string, Source>();
  const assetByName = new Map<string, Asset>();

  for (const seed of SEED) {
    let source = sourceByName.get(seed.sourceName);
    if (source === undefined) {
      source = Source.create({ name: seed.sourceName, type: seed.sourceType, now }, ids.generate());
      await sources.save(source);
      sourceByName.set(seed.sourceName, source);
    }

    let asset = assetByName.get(seed.assetName);
    if (asset === undefined) {
      asset = Asset.create(
        {
          type: seed.assetType,
          name: seed.assetName,
          identifiers: [AssetIdentifier.create(AssetIdentifierKind.ExternalId, `seed:${seed.assetName}`)],
          criticality: seed.criticality,
          now,
        },
        ids.generate(),
      );
      await assets.save(asset);
      assetByName.set(seed.assetName, asset);
    }

    const identifiers = seed.cve
      ? [VulnerabilityIdentifier.create(VulnerabilitySystem.Cve, seed.cve)]
      : [VulnerabilityIdentifier.create(VulnerabilitySystem.PluginId, seed.pluginId ?? 'unknown')];
    const definition = VulnerabilityDefinition.create(
      {
        identifiers,
        title: seed.title,
        baseSeverity: Severity.of(seed.severity),
        cwes: seed.cwe === undefined ? [] : [Cwe.create(seed.cwe)],
        epss: seed.epss === undefined ? undefined : EpssScore.create(seed.epss, seed.epss),
        knownExploited: seed.knownExploited,
        now,
      },
      ids.generate(),
    );
    await definitions.save(definition);

    const finding = Finding.reconstitute(
      {
        assetId: asset.id,
        vulnerabilityDefinitionId: definition.id,
        sourceId: source.id,
        scanImportId: null,
        assessmentId: null,
        title: seed.title,
        status: seed.status,
        severity: Severity.of(seed.severity),
        confidence: null,
        riskScore: RiskScore.of(seed.riskScore),
        location: null,
        fingerprint: null,
        uniqueIdFromTool: null,
        vulnIdFromTool: null,
        duplicateOfId: null,
        riskAcceptanceId: null,
        firstDetectedAt: new Date(seed.firstSeen),
        lastDetectedAt: new Date(seed.lastSeen),
        statusChangedAt: new Date(seed.lastSeen),
        mitigatedAt: seed.status === FindingStatus.Mitigated ? new Date(seed.lastSeen) : null,
        createdAt: new Date(seed.firstSeen),
      },
      ids.generate(),
    );
    await findings.save(finding);
  }
}
