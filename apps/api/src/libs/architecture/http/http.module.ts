import { Module } from '@nestjs/common';
import {
  AcceptFinding,
  CLOCK,
  Clock,
  CONNECTOR_CATALOG,
  ConnectorCatalog,
  EnsureDefaultPriorityScheme,
  FINDING_READ_STORE,
  FINDING_REPOSITORY,
  FindingReadStore,
  GetActivePriorityScheme,
  ID_GENERATOR,
  IdGenerator,
  ListConnectors,
  ListFindings,
  ListSources,
  MitigateFinding,
  PRIORITY_EVALUATION_STRATEGY,
  PRIORITY_SCHEME_REPOSITORY,
  PreviewRuleCondition,
  RegisterSource,
  RevisePriorityScheme,
  RISK_ACCEPTANCE_REPOSITORY,
  SOURCE_REGISTRY,
  SourceRegistry,
} from '../../application';
import {
  DefaultPriorityEvaluationStrategy,
  FindingRepository,
  PrioritySchemeRepository,
  RiskAcceptanceRepository,
} from '../../domain';
import { PersistenceModule } from '../persistence';
import { InMemorySourceRegistry, StaticConnectorCatalog } from '../sources';
import { CryptoIdGenerator, SystemClock } from '../system';
import { FindingsController } from './controllers/findings.controller';
import { HealthController } from './controllers/health.controller';
import { PrioritySchemeController } from './controllers/priority-scheme.controller';
import { SourcesController } from './controllers/sources.controller';

/**
 * HTTP delivery module — the NestJS wiring at the infrastructure edge. Persistence
 * ports are bound by {@link PersistenceModule} (Postgres or in-memory); this
 * module binds the remaining adapters and builds the framework-agnostic use cases
 * via factory providers, keeping the application layer free of NestJS.
 */
@Module({
  imports: [PersistenceModule.register()],
  controllers: [FindingsController, HealthController, PrioritySchemeController, SourcesController],
  providers: [
    { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
    { provide: CLOCK, useClass: SystemClock },
    { provide: CONNECTOR_CATALOG, useClass: StaticConnectorCatalog },
    { provide: SOURCE_REGISTRY, useClass: InMemorySourceRegistry },

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

    {
      provide: ListConnectors,
      useFactory: (catalog: ConnectorCatalog): ListConnectors => new ListConnectors(catalog),
      inject: [CONNECTOR_CATALOG],
    },
    {
      provide: ListSources,
      useFactory: (registry: SourceRegistry): ListSources => new ListSources(registry),
      inject: [SOURCE_REGISTRY],
    },
    {
      provide: RegisterSource,
      useFactory: (
        catalog: ConnectorCatalog,
        registry: SourceRegistry,
        ids: IdGenerator,
        clock: Clock,
      ): RegisterSource => new RegisterSource(catalog, registry, ids, clock),
      inject: [CONNECTOR_CATALOG, SOURCE_REGISTRY, ID_GENERATOR, CLOCK],
    },

    {
      provide: PRIORITY_EVALUATION_STRATEGY,
      useFactory: (): DefaultPriorityEvaluationStrategy => new DefaultPriorityEvaluationStrategy(),
    },
    {
      provide: GetActivePriorityScheme,
      useFactory: (schemes: PrioritySchemeRepository): GetActivePriorityScheme =>
        new GetActivePriorityScheme(schemes),
      inject: [PRIORITY_SCHEME_REPOSITORY],
    },
    {
      provide: RevisePriorityScheme,
      useFactory: (schemes: PrioritySchemeRepository, clock: Clock): RevisePriorityScheme =>
        new RevisePriorityScheme(schemes, clock),
      inject: [PRIORITY_SCHEME_REPOSITORY, CLOCK],
    },
    {
      provide: EnsureDefaultPriorityScheme,
      useFactory: (
        schemes: PrioritySchemeRepository,
        ids: IdGenerator,
        clock: Clock,
      ): EnsureDefaultPriorityScheme => new EnsureDefaultPriorityScheme(schemes, ids, clock),
      inject: [PRIORITY_SCHEME_REPOSITORY, ID_GENERATOR, CLOCK],
    },
    {
      provide: PreviewRuleCondition,
      useFactory: (): PreviewRuleCondition => new PreviewRuleCondition(),
    },
  ],
})
export class HttpModule {}
