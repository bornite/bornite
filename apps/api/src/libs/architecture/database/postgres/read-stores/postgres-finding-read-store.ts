import { DataSource } from 'typeorm';
import { FindingListItem, FindingReadStore } from '../../../../application';

interface WorklistRow {
  id: string;
  title: string;
  severity: string;
  status: string;
  risk_score: number | null;
  first_detected_at: Date;
  last_detected_at: Date;
  asset_name: string;
  asset_type: string;
  vuln_identifiers: Array<{ system: string; value: string }>;
  vuln_cwes: Array<{ id: number }>;
  vuln_epss: { probability: number } | null;
  vuln_known_exploited: boolean;
  source_name: string;
  source_type: string;
}

/**
 * The findings worklist read projection: a single denormalizing JOIN across
 * findings, assets, the vulnerability catalog and sources, ordered by risk. This
 * is the Postgres implementation of the {@link FindingReadStore} query port — the
 * CQRS read side, kept separate from the write aggregates/repositories.
 */
const WORKLIST_SQL = `
  SELECT f.id, f.title, f.severity, f.status, f.risk_score,
         f.first_detected_at, f.last_detected_at,
         a.name AS asset_name, a.type AS asset_type,
         vd.identifiers AS vuln_identifiers, vd.cwes AS vuln_cwes,
         vd.epss AS vuln_epss, vd.known_exploited AS vuln_known_exploited,
         s.name AS source_name, s.type AS source_type
  FROM findings f
  JOIN assets a ON a.id = f.asset_id
  JOIN vulnerability_definitions vd ON vd.id = f.vulnerability_definition_id
  JOIN sources s ON s.id = f.source_id
  ORDER BY f.risk_score DESC NULLS LAST
`;

export class PostgresFindingReadStore implements FindingReadStore {
  public constructor(private readonly dataSource: DataSource) {}

  public async listWorklist(): Promise<FindingListItem[]> {
    const rows = (await this.dataSource.query(WORKLIST_SQL)) as WorklistRow[];
    return rows.map((row) => this.toItem(row));
  }

  private toItem(row: WorklistRow): FindingListItem {
    const cve = row.vuln_identifiers.find((i) => i.system === 'CVE')?.value;
    const primaryId = cve ?? row.vuln_identifiers[0]?.value ?? row.id;
    const cwe = row.vuln_cwes.length > 0 ? row.vuln_cwes[0].id : undefined;

    return {
      id: row.id,
      title: row.title,
      severity: row.severity as FindingListItem['severity'],
      status: row.status as FindingListItem['status'],
      riskScore: row.risk_score ?? 0,
      asset: { name: row.asset_name, type: row.asset_type as FindingListItem['asset']['type'] },
      vulnerability: { id: primaryId, cve },
      source: row.source_name,
      sourceType: row.source_type as FindingListItem['sourceType'],
      cwe,
      epss: row.vuln_epss?.probability,
      knownExploited: row.vuln_known_exploited,
      firstSeen: new Date(row.first_detected_at).toISOString().slice(0, 10),
      lastSeen: new Date(row.last_detected_at).toISOString().slice(0, 10),
    };
  }
}
