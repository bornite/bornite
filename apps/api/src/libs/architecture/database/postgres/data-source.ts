import { DataSource } from 'typeorm';
import {
  AssessmentEntity,
  AssetEntity,
  FindingEntity,
  FindingGroupEntity,
  RiskAcceptanceEntity,
  ScanImportEntity,
  SourceEntity,
  VulnerabilityDefinitionEntity,
} from './entities';

export const POSTGRES_ENTITIES = [
  AssetEntity,
  VulnerabilityDefinitionEntity,
  FindingEntity,
  SourceEntity,
  ScanImportEntity,
  AssessmentEntity,
  RiskAcceptanceEntity,
  FindingGroupEntity,
];

/**
 * Build the TypeORM DataSource from the environment. `synchronize` is on by
 * default for development (auto-creates the schema from the entities); a real
 * deployment would turn it off and run migrations instead.
 */
export function createDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: POSTGRES_ENTITIES,
    synchronize: process.env.DB_SYNCHRONIZE !== 'false',
    logging: process.env.DB_LOGGING === 'true',
  });
}
