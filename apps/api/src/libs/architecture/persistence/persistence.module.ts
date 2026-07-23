import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  FINDING_READ_STORE,
  FINDING_REPOSITORY,
  PRIORITY_SCHEME_REPOSITORY,
  RISK_ACCEPTANCE_REPOSITORY,
} from '../../application';
import {
  InMemoryFindingStore,
  InMemoryPrioritySchemeRepository,
  InMemoryRiskAcceptanceRepository,
} from '../database/in-memory';
import { createDataSource } from '../database/postgres/data-source';
import { FindingEntity, PrioritySchemeEntity, RiskAcceptanceEntity } from '../database/postgres/entities';
import { PostgresFindingReadStore } from '../database/postgres/read-stores';
import {
  PostgresFindingRepository,
  PostgresPrioritySchemeRepository,
  PostgresRiskAcceptanceRepository,
} from '../database/postgres/repositories';
import { seedIfEmpty } from '../database/postgres/seed';
import { CryptoIdGenerator, SystemClock } from '../system';

const DATA_SOURCE = Symbol('DataSource');

const PERSISTENCE_EXPORTS = [
  FINDING_READ_STORE,
  FINDING_REPOSITORY,
  RISK_ACCEPTANCE_REPOSITORY,
  PRIORITY_SCHEME_REPOSITORY,
];

/**
 * Selects the persistence adapters at composition time: Postgres when
 * `DATABASE_URL` is set, otherwise the in-memory stand-ins (so the app runs with
 * zero setup). Either way it binds the same ports, so nothing upstream changes.
 */
@Module({})
export class PersistenceModule {
  public static register(): DynamicModule {
    const providers = process.env.DATABASE_URL ? postgresProviders() : memoryProviders();
    return { module: PersistenceModule, providers, exports: PERSISTENCE_EXPORTS };
  }
}

function memoryProviders(): Provider[] {
  return [
    InMemoryFindingStore,
    { provide: FINDING_READ_STORE, useExisting: InMemoryFindingStore },
    { provide: FINDING_REPOSITORY, useExisting: InMemoryFindingStore },
    InMemoryRiskAcceptanceRepository,
    { provide: RISK_ACCEPTANCE_REPOSITORY, useExisting: InMemoryRiskAcceptanceRepository },
    InMemoryPrioritySchemeRepository,
    { provide: PRIORITY_SCHEME_REPOSITORY, useExisting: InMemoryPrioritySchemeRepository },
  ];
}

function postgresProviders(): Provider[] {
  return [
    {
      provide: DATA_SOURCE,
      useFactory: async (): Promise<DataSource> => {
        const dataSource = createDataSource();
        await dataSource.initialize();
        await seedIfEmpty(dataSource, new CryptoIdGenerator(), new SystemClock());
        return dataSource;
      },
    },
    {
      provide: FINDING_READ_STORE,
      useFactory: (dataSource: DataSource) => new PostgresFindingReadStore(dataSource),
      inject: [DATA_SOURCE],
    },
    {
      provide: FINDING_REPOSITORY,
      useFactory: (dataSource: DataSource) =>
        new PostgresFindingRepository(dataSource.getRepository(FindingEntity)),
      inject: [DATA_SOURCE],
    },
    {
      provide: RISK_ACCEPTANCE_REPOSITORY,
      useFactory: (dataSource: DataSource) =>
        new PostgresRiskAcceptanceRepository(dataSource.getRepository(RiskAcceptanceEntity)),
      inject: [DATA_SOURCE],
    },
    {
      provide: PRIORITY_SCHEME_REPOSITORY,
      useFactory: (dataSource: DataSource) =>
        new PostgresPrioritySchemeRepository(dataSource.getRepository(PrioritySchemeEntity)),
      inject: [DATA_SOURCE],
    },
  ];
}
