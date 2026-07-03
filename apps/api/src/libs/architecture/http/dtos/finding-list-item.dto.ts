import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AssetType, FindingStatus, Severity, SourceType } from '../../../application';

const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
const STATUSES: FindingStatus[] = [
  'OPEN',
  'CONFIRMED',
  'RISK_ACCEPTED',
  'MITIGATED',
  'RESOLVED',
  'FALSE_POSITIVE',
];
const ASSET_TYPES: AssetType[] = [
  'HOST',
  'WEB_APPLICATION',
  'CONTAINER',
  'CODE_REPOSITORY',
  'CLOUD_RESOURCE',
];
const SOURCE_TYPES: SourceType[] = [
  'NETWORK_SCANNER',
  'SAST',
  'DAST',
  'SCA',
  'CSPM',
  'CONTAINER_SCANNER',
];

export class AssetSummaryDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ASSET_TYPES })
  type!: AssetType;
}

export class VulnerabilitySummaryDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  cve?: string;
}

/** OpenAPI schema for one row of the findings worklist (mirrors FindingListItem). */
export class FindingListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: SEVERITIES })
  severity!: Severity;

  @ApiProperty({ enum: STATUSES })
  status!: FindingStatus;

  @ApiProperty({ description: 'Computed 0–100 risk score.' })
  riskScore!: number;

  @ApiProperty({ type: AssetSummaryDto })
  asset!: AssetSummaryDto;

  @ApiProperty({ type: VulnerabilitySummaryDto })
  vulnerability!: VulnerabilitySummaryDto;

  @ApiProperty()
  source!: string;

  @ApiProperty({ enum: SOURCE_TYPES })
  sourceType!: SourceType;

  @ApiPropertyOptional()
  cwe?: number;

  @ApiPropertyOptional({ description: 'EPSS probability, 0–1.' })
  epss?: number;

  @ApiProperty()
  knownExploited!: boolean;

  @ApiProperty()
  firstSeen!: string;

  @ApiProperty()
  lastSeen!: string;
}
