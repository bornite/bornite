import { ApiProperty } from '@nestjs/swagger';

export class SourceListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  connectorKey!: string;

  @ApiProperty()
  sourceType!: string;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  createdAt!: string;
}
