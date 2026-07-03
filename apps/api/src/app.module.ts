import { Module } from '@nestjs/common';
import { FindingsModule } from './modules/findings/findings.module';
import { HealthModule } from './modules/health/health.module';

/**
 * Root HTTP module. This is the framework/presentation edge — it wires feature
 * modules that expose the clean core (domain/application) over REST. The core in
 * `libs/` stays free of any NestJS coupling.
 */
@Module({
  imports: [HealthModule, FindingsModule],
})
export class AppModule {}
