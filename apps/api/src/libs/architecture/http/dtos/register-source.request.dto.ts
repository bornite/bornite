import { ApiProperty } from '@nestjs/swagger';

export class RegisterSourceRequestDto {
  @ApiProperty({ description: 'The connector type key, e.g. "checkmarx-sca".' })
  connectorKey!: string;

  @ApiProperty({ description: 'A display name for this source.' })
  name!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Connector-specific settings (see the connector descriptor).',
  })
  config!: Record<string, unknown>;
}
