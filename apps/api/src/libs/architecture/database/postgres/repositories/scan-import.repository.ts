import { FindOptionsWhere, Repository as TypeOrmRepository } from 'typeorm';
import { ScanImport, ScanImportRepository } from '../../../../domain';
import { ScanImportEntity } from '../entities/scan-import.entity';
import { ScanImportMapper } from '../mappers/scan-import.mapper';
import { PostgresRepository } from './postgres.repository';

export class PostgresScanImportRepository
  extends PostgresRepository<ScanImport, ScanImportEntity>
  implements ScanImportRepository
{
  public constructor(repository: TypeOrmRepository<ScanImportEntity>) {
    super(repository, new ScanImportMapper());
  }

  public async findByAssessment(assessmentId: string): Promise<ScanImport[]> {
    const rows = await this.repository.findBy({ assessmentId } as FindOptionsWhere<ScanImportEntity>);
    return rows.map((row) => this.mapper.toDomain(row));
  }
}
