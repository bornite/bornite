import { FindingReadStore } from '../ports/finding-read-store';
import { FindingListItem } from '../read-models/finding-list-item.read-model';

/**
 * Return the prioritized findings worklist, ranked by risk score. A thin query
 * use case today; the seam where filtering, scoping and authorization will live.
 * Framework-agnostic — wired by the HTTP module, not decorated by it.
 */
export class ListFindings {
  public constructor(private readonly findings: FindingReadStore) {}

  public async execute(): Promise<FindingListItem[]> {
    const items = await this.findings.listWorklist();
    // Primary sort: configured priority rank (higher = more urgent); tie-break on
    // risk score. Findings not yet prioritized fall back to pure risk ordering.
    const rank = (item: FindingListItem): number => item.priority?.rank ?? -1;
    return [...items].sort((a, b) => rank(b) - rank(a) || b.riskScore - a.riskScore);
  }
}
