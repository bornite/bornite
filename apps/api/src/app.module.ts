import { Module } from '@nestjs/common';
import { HttpModule } from './libs/architecture/http/http.module';

/**
 * Composition root. The HTTP delivery layer lives in the infrastructure edge
 * (`libs/architecture/http`); the clean core in `libs/{domain,application}` has
 * no NestJS coupling.
 */
@Module({
  imports: [HttpModule],
})
export class AppModule {}
