import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConnectorConfigFieldDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({ enum: ['text', 'password'] })
  type!: 'text' | 'password';

  @ApiProperty()
  required!: boolean;

  @ApiPropertyOptional()
  placeholder?: string;
}

export class ConnectorDescriptorDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  sourceType!: string;

  @ApiProperty({ type: [String] })
  modes!: string[];

  @ApiProperty({ type: [ConnectorConfigFieldDto] })
  configFields!: ConnectorConfigFieldDto[];
}
