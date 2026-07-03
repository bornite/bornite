import { Repository as TypeOrmRepository } from 'typeorm';
import { RiskAcceptance, RiskAcceptanceRepository } from '../../../../libs/domain';
import { RiskAcceptanceEntity } from '../entities/risk-acceptance.entity';
import { RiskAcceptanceMapper } from '../mappers/risk-acceptance.mapper';
import { PostgresRepository } from './postgres.repository';

export class PostgresRiskAcceptanceRepository
  extends PostgresRepository<RiskAcceptance, RiskAcceptanceEntity>
  implements RiskAcceptanceRepository
{
  public constructor(repository: TypeOrmRepository<RiskAcceptanceEntity>) {
    super(repository, new RiskAcceptanceMapper());
  }

  public async findExpirable(asOf: Date): Promise<RiskAcceptance[]> {
    const rows = await this.repository
      .createQueryBuilder('ra')
      .where('ra.expiresAt IS NOT NULL')
      .andWhere('ra.expiresAt <= :asOf', { asOf })
      .andWhere('ra.handledAt IS NULL')
      .getMany();
    return rows.map((row) => this.mapper.toDomain(row));
  }

  public async findByFinding(findingId: string): Promise<RiskAcceptance[]> {
    const contained = JSON.stringify([findingId]);
    const rows = await this.repository
      .createQueryBuilder('ra')
      .where('ra.acceptedFindingIds @> :finding', { finding: contained })
      .getMany();
    return rows.map((row) => this.mapper.toDomain(row));
  }
}
