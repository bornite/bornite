import { Module } from '@nestjs/common';
import {
  AcceptFinding,
  CLOCK,
  Clock,
  FINDING_READ_STORE,
  FINDING_REPOSITORY,
  FindingReadStore,
  ID_GENERATOR,
  IdGenerator,
  ListFindings,
  MitigateFinding,
  RISK_ACCEPTANCE_REPOSITORY,
} from '../../application';
import {
  FindingRepository,
  RiskAcceptanceRepository,
} from '../../domain';
import {
  InMemoryFindingStore,
  InMemoryRiskAcceptanceRepository,
} from '../database/in-memory';
import { CryptoIdGenerator, SystemClock } from '../system';
import { FindingsController } from './controllers/findings.controller';
import { HealthController } from './controllers/health.controller';

/**
 * HTTP delivery module — the NestJS wiring at the infrastructure edge. It binds
 * ports to adapters and constructs framework-agnostic use cases via factory
 * providers, so the application layer stays free of NestJS. The in-memory finding
 * store is a single instance shared by the read port and the write repository.
 */
@Module({
  controllers: [FindingsController, HealthController],
  providers: [
    InMemoryFindingStore,
    { provide: FINDING_READ_STORE, useExisting: InMemoryFindingStore },
    { provide: FINDING_REPOSITORY, useExisting: InMemoryFindingStore },

    InMemoryRiskAcceptanceRepository,
    { provide: RISK_ACCEPTANCE_REPOSITORY, useExisting: InMemoryRiskAcceptanceRepository },

    { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
    { provide: CLOCK, useClass: SystemClock },

    {
      provide: ListFindings,
      useFactory: (store: FindingReadStore): ListFindings => new ListFindings(store),
      inject: [FINDING_READ_STORE],
    },
    {
      provide: AcceptFinding,
      useFactory: (
        findings: FindingRepository,
        riskAcceptances: RiskAcceptanceRepository,
        ids: IdGenerator,
        clock: Clock,
      ): AcceptFinding => new AcceptFinding(findings, riskAcceptances, ids, clock),
      inject: [FINDING_REPOSITORY, RISK_ACCEPTANCE_REPOSITORY, ID_GENERATOR, CLOCK],
    },
    {
      provide: MitigateFinding,
      useFactory: (findings: FindingRepository, clock: Clock): MitigateFinding =>
        new MitigateFinding(findings, clock),
      inject: [FINDING_REPOSITORY, CLOCK],
    },
  ],
})
export class HttpModule {}
