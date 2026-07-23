import { ApiProperty } from '@nestjs/swagger';

export class PreviewPriorityRequestDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'A condition ({ kind: "tree", root }) to test.',
  })
  condition!: unknown;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Sample facts — a partial FindingFacts map keyed by fact, e.g. { "cvss.baseScore": 9.1 }.',
  })
  facts!: Record<string, unknown>;
}

export class PreviewPriorityResponseDto {
  @ApiProperty({ description: 'Whether the condition matches the supplied facts.' })
  matches!: boolean;
}
