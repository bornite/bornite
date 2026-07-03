import { CollectionMode, Connector, NormalizedRecord, SyncContext } from '../../../../application';
import { SourceType } from '../../../../domain';
import { CheckmarxSastClient } from './checkmarx-sast.client';
import { parseCheckmarxSastConfig } from './checkmarx-sast.config';
import { toCheckmarxSastRecord } from './checkmarx-sast.mapper';

/**
 * Pull connector for classic Checkmarx CxSAST. For each project it takes the last
 * finished scan, generates and parses the XML report, and streams one normalized
 * record per code finding. Snapshot semantics: findings a later scan no longer
 * reports are auto-resolved by the ingestion pipeline.
 */
export class CheckmarxSastConnector implements Connector {
  public readonly key = 'checkmarx-sast';
  public readonly sourceType = SourceType.Sast;
  public readonly modes: readonly CollectionMode[] = [CollectionMode.Pull];
  public readonly reconcileMode = 'snapshot' as const;

  public async *sync(context: SyncContext): AsyncGenerator<NormalizedRecord> {
    const config = parseCheckmarxSastConfig(context.config);
    const client = new CheckmarxSastClient(config);
    await client.authenticate();

    for (const project of await client.listProjects()) {
      if (context.signal?.aborted === true) {
        return;
      }
      const scan = await client.lastFinishedScan(project.id);
      if (scan === null) {
        continue;
      }
      for (const finding of await client.getResults(scan.id)) {
        yield toCheckmarxSastRecord(project, finding);
      }
    }
  }
}
