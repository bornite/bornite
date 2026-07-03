import { Module } from '@nestjs/common';
import { FINDING_READ_STORE, FindingReadStore, ListFindings } from '../../application';
import { InMemoryFindingReadStore } from '../database/in-memory/in-memory-finding-read-store';
import { FindingsController } from './controllers/findings.controller';
import { HealthController } from './controllers/health.controller';

/**
 * HTTP delivery module — the NestJS wiring at the infrastructure edge. It binds
 * the read-store port to its adapter and constructs framework-agnostic use cases
 * via factory providers, so the application layer stays free of NestJS.
 */
@Module({
  controllers: [FindingsController, HealthController],
  providers: [
    { provide: FINDING_READ_STORE, useClass: InMemoryFindingReadStore },
    {
      provide: ListFindings,
      useFactory: (store: FindingReadStore): ListFindings => new ListFindings(store),
      inject: [FINDING_READ_STORE],
    },
  ],
})
export class HttpModule {}
