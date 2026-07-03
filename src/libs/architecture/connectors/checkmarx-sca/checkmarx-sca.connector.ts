import { CollectionMode, Connector, NormalizedRecord, SyncContext } from '../../../application';
import { SourceType } from '../../../domain';
import { CheckmarxScaClient } from './checkmarx-sca.client';
import { parseCheckmarxScaConfig } from './checkmarx-sca.config';
import { toNormalizedRecord } from './checkmarx-sca.mapper';
import { CheckmarxPackage } from './checkmarx-sca.types';

/**
 * Pull connector for Checkmarx SCA. For each project it takes the latest scan,
 * joins vulnerabilities to their packages, and streams one normalized record per
 * (package, vulnerability). Snapshot semantics: findings a later scan no longer
 * reports are auto-resolved by the ingestion pipeline.
 */
export class CheckmarxScaConnector implements Connector {
  public readonly key = 'checkmarx-sca';
  public readonly sourceType = SourceType.Sca;
  public readonly modes: readonly CollectionMode[] = [CollectionMode.Pull];
  public readonly reconcileMode = 'snapshot' as const;

  public async *sync(context: SyncContext): AsyncGenerator<NormalizedRecord> {
    const config = parseCheckmarxScaConfig(context.config);
    const client = new CheckmarxScaClient(config);
    await client.authenticate();

    for (const project of await client.listProjects()) {
      if (context.signal?.aborted === true) {
        return;
      }
      const scan = await client.latestScan(project.id);
      if (scan === null) {
        continue;
      }
      const reportId = scan.riskReportId.length > 0 ? scan.riskReportId : scan.scanId;

      const packagesById = new Map<string, CheckmarxPackage>(
        (await client.listPackages(reportId)).map((pkg): [string, CheckmarxPackage] => [pkg.id, pkg]),
      );

      for (const vulnerability of await client.listVulnerabilities(reportId)) {
        yield toNormalizedRecord(
          project,
          vulnerability,
          packagesById.get(vulnerability.packageId) ?? null,
        );
      }
    }
  }
}
