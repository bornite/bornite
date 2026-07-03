import { ScanImport, ScanImportRepository, SourceRepository } from '../../domain';
import { Clock } from '../ports/clock';
import { IdGenerator } from '../ports/id-generator';
import { ConnectorRegistry } from './connector-registry';
import { SyncContext } from './connector';
import { ConnectorConfigStore } from './connector-config-store';
import { IngestionService } from './ingestion.service';
import { SyncStateStore } from './sync-state-store';

export interface RunSourceSyncInput {
  readonly sourceId: string;
  readonly assessmentId?: string;
}

/**
 * Orchestrates one sync run end-to-end: resolve the source's connector, open a
 * `ScanImport`, stream normalized records through the {@link IngestionService},
 * then finalise the import (counts on success, error on failure) and advance the
 * incremental cursor. This is the unit a queue worker executes per job.
 */
export class RunSourceSync {
  public constructor(
    private readonly registry: ConnectorRegistry,
    private readonly sources: SourceRepository,
    private readonly scanImports: ScanImportRepository,
    private readonly configStore: ConnectorConfigStore,
    private readonly syncState: SyncStateStore,
    private readonly ingestion: IngestionService,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  public async execute(input: RunSourceSyncInput): Promise<ScanImport> {
    const now = this.clock.now();

    const source = await this.sources.findById(input.sourceId);
    if (source === null) {
      throw new Error(`Source ${input.sourceId} not found.`);
    }

    const config = await this.configStore.get(input.sourceId);
    if (config === null) {
      throw new Error(`No connector configuration for source ${input.sourceId}.`);
    }

    const connector = this.registry.get(config.connectorKey);
    if (connector === null) {
      throw new Error(`Unknown connector "${config.connectorKey}".`);
    }

    const state = await this.syncState.load(input.sourceId);

    const scanImport = ScanImport.create(
      { sourceId: input.sourceId, scanType: connector.key, assessmentId: input.assessmentId, now },
      this.ids.generate(),
    );
    scanImport.beginProcessing();
    await this.scanImports.save(scanImport);

    try {
      const context: SyncContext = {
        sourceId: input.sourceId,
        config: config.settings,
        cursor: state?.cursor ?? null,
      };
      const counts = await this.ingestion.ingest({
        source,
        scanImport,
        assessmentId: input.assessmentId ?? null,
        records: connector.sync(context),
        reconcileMode: connector.reconcileMode,
      });

      scanImport.complete(counts);
      await this.scanImports.save(scanImport);
      // Simple high-water-mark cursor: next run asks the connector for changes
      // since this run started. Connectors needing finer cursors can extend this.
      await this.syncState.save({ sourceId: input.sourceId, cursor: now.toISOString(), lastSyncedAt: now });
      return scanImport;
    } catch (error) {
      scanImport.fail(error instanceof Error ? error.message : String(error));
      await this.scanImports.save(scanImport);
      throw error;
    }
  }
}
