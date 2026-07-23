import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PriorityLevelDto {
  @ApiProperty({ example: 'P0' })
  key!: string;

  @ApiProperty({ example: 'Critical — act now' })
  label!: string;

  @ApiProperty({ description: 'Urgency rank; higher = more urgent.', example: 4 })
  rank!: number;

  @ApiPropertyOptional({ nullable: true, example: '#dc2626' })
  color!: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Remediation SLA in days.', example: 1 })
  slaDays!: number | null;
}

export class PriorityRuleDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ description: 'Key of the level this rule assigns.' })
  levelKey!: string;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Serialized condition ({ kind: "tree", root }).',
  })
  condition!: unknown;
}

/** OpenAPI schema for the active priority scheme (mirrors the PriorityScheme aggregate). */
export class PrioritySchemeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  active!: boolean;

  @ApiProperty({ description: 'Monotonic version, bumped on every revision.' })
  version!: number;

  @ApiProperty({ description: 'Level assigned when no rule matches.' })
  defaultLevelKey!: string;

  @ApiProperty({ type: [PriorityLevelDto] })
  levels!: PriorityLevelDto[];

  @ApiProperty({ type: [PriorityRuleDto] })
  rules!: PriorityRuleDto[];
}
