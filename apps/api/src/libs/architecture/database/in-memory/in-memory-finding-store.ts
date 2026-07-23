import {
  Finding,
  FindingFingerprint,
  FindingRepository,
  FindingStatus,
  RiskScore,
  Severity,
  SeverityLevel,
} from '../../../domain';
import type {
  AssetType as ReadAssetType,
  FindingListItem,
  FindingReadStore,
  FindingStatus as ReadFindingStatus,
  Severity as ReadSeverity,
  SourceType as ReadSourceType,
} from '../../../application';

/** Denormalized display fields that live on other aggregates in the real model. */
interface Display {
  assetName: string;
  assetType: ReadAssetType;
  vulnId: string;
  cve?: string;
  source: string;
  sourceType: ReadSourceType;
  cwe?: number;
  epss?: number;
  knownExploited: boolean;
  firstSeen: string;
  lastSeen: string;
}

interface Seed {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: FindingStatus;
  riskScore: number;
  display: Display;
}

const SEED: Seed[] = [
  {
    id: 'f-1001',
    title: 'Apache Log4j2 remote code execution (Log4Shell)',
    severity: SeverityLevel.Critical,
    status: FindingStatus.Open,
    riskScore: 98,
    display: { assetName: 'payments-api', assetType: 'CODE_REPOSITORY', vulnId: 'CVE-2021-44228', cve: 'CVE-2021-44228', source: 'Checkmarx SCA', sourceType: 'SCA', cwe: 502, epss: 0.975, knownExploited: true, firstSeen: '2026-06-18', lastSeen: '2026-07-02' },
  },
  {
    id: 'f-1002',
    title: 'Spring Framework RCE (Spring4Shell)',
    severity: SeverityLevel.Critical,
    status: FindingStatus.Confirmed,
    riskScore: 94,
    display: { assetName: 'checkout-service', assetType: 'CONTAINER', vulnId: 'CVE-2022-22965', cve: 'CVE-2022-22965', source: 'Trivy', sourceType: 'CONTAINER_SCANNER', cwe: 94, epss: 0.94, knownExploited: true, firstSeen: '2026-06-20', lastSeen: '2026-07-02' },
  },
  {
    id: 'f-1003',
    title: 'SQL injection in order lookup',
    severity: SeverityLevel.High,
    status: FindingStatus.Open,
    riskScore: 82,
    display: { assetName: 'payments-api', assetType: 'CODE_REPOSITORY', vulnId: 'cxsast:query:589', source: 'Checkmarx SAST', sourceType: 'SAST', cwe: 89, knownExploited: false, firstSeen: '2026-06-28', lastSeen: '2026-07-02' },
  },
  {
    id: 'f-1004',
    title: 'OpenSSL infinite loop (DoS)',
    severity: SeverityLevel.High,
    status: FindingStatus.Open,
    riskScore: 74,
    display: { assetName: 'edge-gateway-01', assetType: 'HOST', vulnId: 'CVE-2022-0778', cve: 'CVE-2022-0778', source: 'Tenable Nessus', sourceType: 'NETWORK_SCANNER', epss: 0.61, knownExploited: false, firstSeen: '2026-05-30', lastSeen: '2026-07-01' },
  },
  {
    id: 'f-1005',
    title: 'Reflected XSS in search parameter',
    severity: SeverityLevel.Medium,
    status: FindingStatus.Confirmed,
    riskScore: 58,
    display: { assetName: 'www.acme.example', assetType: 'WEB_APPLICATION', vulnId: 'cxsast:query:12', source: 'Checkmarx SAST', sourceType: 'SAST', cwe: 79, knownExploited: false, firstSeen: '2026-06-25', lastSeen: '2026-07-02' },
  },
  {
    id: 'f-1006',
    title: 'S3 bucket publicly readable',
    severity: SeverityLevel.High,
    status: FindingStatus.RiskAccepted,
    riskScore: 66,
    display: { assetName: 'arn:aws:s3:::acme-public-assets', assetType: 'CLOUD_RESOURCE', vulnId: 'cspm:s3-public-read', source: 'Prowler', sourceType: 'CSPM', knownExploited: false, firstSeen: '2026-04-11', lastSeen: '2026-07-02' },
  },
  {
    id: 'f-1007',
    title: 'Outdated lodash prototype pollution',
    severity: SeverityLevel.Medium,
    status: FindingStatus.Open,
    riskScore: 44,
    display: { assetName: 'web-frontend', assetType: 'CODE_REPOSITORY', vulnId: 'CVE-2019-10744', cve: 'CVE-2019-10744', source: 'Checkmarx SCA', sourceType: 'SCA', cwe: 1321, epss: 0.12, knownExploited: false, firstSeen: '2026-06-15', lastSeen: '2026-07-02' },
  },
  {
    id: 'f-1008',
    title: 'TLS 1.0/1.1 enabled',
    severity: SeverityLevel.Low,
    status: FindingStatus.Open,
    riskScore: 22,
    display: { assetName: 'edge-gateway-01', assetType: 'HOST', vulnId: 'nessus:104743', source: 'Tenable Nessus', sourceType: 'NETWORK_SCANNER', knownExploited: false, firstSeen: '2026-05-30', lastSeen: '2026-07-01' },
  },
  {
    id: 'f-1009',
    title: 'Missing HTTP security headers',
    severity: SeverityLevel.Low,
    status: FindingStatus.Mitigated,
    riskScore: 15,
    display: { assetName: 'www.acme.example', assetType: 'WEB_APPLICATION', vulnId: 'zap:10038', source: 'OWASP ZAP', sourceType: 'DAST', knownExploited: false, firstSeen: '2026-06-01', lastSeen: '2026-06-29' },
  },
  {
    id: 'f-1010',
    title: 'Container runs as root',
    severity: SeverityLevel.Medium,
    status: FindingStatus.Open,
    riskScore: 39,
    display: { assetName: 'checkout-service', assetType: 'CONTAINER', vulnId: 'trivy:DS002', source: 'Trivy', sourceType: 'CONTAINER_SCANNER', knownExploited: false, firstSeen: '2026-06-20', lastSeen: '2026-07-02' },
  },
];

function buildFinding(seed: Seed): Finding {
  return Finding.reconstitute(
    {
      assetId: `${seed.id}:asset`,
      vulnerabilityDefinitionId: `${seed.id}:vuln`,
      sourceId: `${seed.id}:source`,
      scanImportId: null,
      assessmentId: null,
      title: seed.title,
      status: seed.status,
      severity: Severity.of(seed.severity),
      confidence: null,
      riskScore: RiskScore.of(seed.riskScore),
      priority: null,
      location: null,
      fingerprint: null,
      uniqueIdFromTool: null,
      vulnIdFromTool: null,
      duplicateOfId: null,
      riskAcceptanceId: null,
      firstDetectedAt: new Date(seed.display.firstSeen),
      lastDetectedAt: new Date(seed.display.lastSeen),
      statusChangedAt: new Date(seed.display.lastSeen),
      mitigatedAt: seed.status === FindingStatus.Mitigated ? new Date(seed.display.lastSeen) : null,
      createdAt: new Date(seed.display.firstSeen),
    },
    seed.id,
  );
}

/**
 * Single in-memory source of truth backing BOTH the read port ({@link FindingReadStore})
 * and the write repository ({@link FindingRepository}). Each record pairs a live
 * {@link Finding} aggregate (mutated by triage) with the denormalized display
 * fields the worklist needs, so a triage action is reflected on the next read —
 * a hand-rolled stand-in for the write→projection flow, until Postgres is wired.
 */
export class InMemoryFindingStore implements FindingReadStore, FindingRepository {
  private readonly records = new Map<string, { finding: Finding; display: Display }>();

  public constructor() {
    for (const seed of SEED) {
      this.records.set(seed.id, { finding: buildFinding(seed), display: seed.display });
    }
  }

  public async listWorklist(): Promise<FindingListItem[]> {
    return [...this.records.values()].map(({ finding, display }) => ({
      id: finding.id,
      title: finding.title,
      // The enum's string value equals the read-model union member.
      severity: finding.severity.level as unknown as ReadSeverity,
      status: finding.status as unknown as ReadFindingStatus,
      riskScore: finding.riskScore?.value ?? 0,
      asset: { name: display.assetName, type: display.assetType },
      vulnerability: { id: display.vulnId, cve: display.cve },
      source: display.source,
      sourceType: display.sourceType,
      cwe: display.cwe,
      epss: display.epss,
      knownExploited: display.knownExploited,
      priority: finding.priority
        ? {
            levelKey: finding.priority.levelKey,
            rank: finding.priority.rank,
            matchedDefault: finding.priority.matchedDefault,
          }
        : null,
      firstSeen: display.firstSeen,
      lastSeen: display.lastSeen,
    }));
  }

  public async findById(id: string): Promise<Finding | null> {
    return this.records.get(id)?.finding ?? null;
  }

  public async save(finding: Finding): Promise<void> {
    const existing = this.records.get(finding.id);
    if (existing !== undefined) {
      existing.finding = finding;
    }
  }

  public async delete(id: string): Promise<void> {
    this.records.delete(id);
  }

  public async findByFingerprint(
    fingerprint: FindingFingerprint,
    assetId?: string,
  ): Promise<Finding | null> {
    for (const { finding } of this.records.values()) {
      const matchesAsset = assetId === undefined || finding.assetId === assetId;
      if (finding.fingerprint?.value === fingerprint.value && matchesAsset) {
        return finding;
      }
    }
    return null;
  }

  public async findByAsset(assetId: string): Promise<Finding[]> {
    return [...this.records.values()]
      .map((record) => record.finding)
      .filter((finding) => finding.assetId === assetId);
  }

  public async findAll(): Promise<Finding[]> {
    return [...this.records.values()].map((record) => record.finding);
  }
}
