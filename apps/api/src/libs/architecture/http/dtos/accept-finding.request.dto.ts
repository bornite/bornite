import { ApiPropertyOptional } from '@nestjs/swagger';

export class AcceptFindingRequestDto {
  @ApiPropertyOptional({ description: 'Who owns the acceptance. Defaults to the current user.' })
  owner?: string;

  @ApiPropertyOptional({ description: 'Why the risk is being accepted.' })
  justification?: string;
}
