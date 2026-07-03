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
import { FindingRepository, RiskAcceptanceRepository } from '../../domain';
import { PersistenceModule } from '../persistence';
import { CryptoIdGenerator, SystemClock } from '../system';
import { FindingsController } from './controllers/findings.controller';
import { HealthController } from './controllers/health.controller';

/**
 * HTTP delivery module — the NestJS wiring at the infrastructure edge. Ports are
 * bound to adapters by {@link PersistenceModule} (Postgres or in-memory); this
 * module builds the framework-agnostic use cases via factory providers, so the
 * application layer stays free of NestJS.
 */
@Module({
  imports: [PersistenceModule.register()],
  controllers: [FindingsController, HealthController],
  providers: [
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
