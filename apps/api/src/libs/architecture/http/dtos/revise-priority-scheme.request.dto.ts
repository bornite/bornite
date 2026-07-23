import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PriorityLevelInputDto {
  @ApiProperty({ example: 'P0' })
  key!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({ description: 'Urgency rank; higher = more urgent.', example: 4 })
  rank!: number;

  @ApiPropertyOptional({ nullable: true })
  color?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Remediation SLA in days.' })
  slaDays?: number | null;
}

export class PriorityRuleInputDto {
  @ApiPropertyOptional({ description: 'Stable id; omit for a new rule (one is minted).' })
  id?: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ description: 'Key of the level this rule assigns.' })
  levelKey!: string;

  @ApiPropertyOptional({ default: true })
  enabled?: boolean;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Condition ({ kind: "tree", root }).',
  })
  condition!: unknown;
}

/**
 * Edit the active priority scheme. Every field is optional — only what is supplied
 * is changed; omitted fields keep their current value. Any change re-validates the
 * whole scheme and bumps its version.
 */
export class RevisePrioritySchemeRequestDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Level assigned when no rule matches.' })
  defaultLevelKey?: string;

  @ApiPropertyOptional()
  active?: boolean;

  @ApiPropertyOptional({ type: [PriorityLevelInputDto] })
  levels?: PriorityLevelInputDto[];

  @ApiPropertyOptional({ type: [PriorityRuleInputDto] })
  rules?: PriorityRuleInputDto[];
}
