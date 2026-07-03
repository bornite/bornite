import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  AcceptFinding,
  FindingListItem,
  ListFindings,
  MitigateFinding,
} from '../../../application';
import { AcceptFindingRequestDto } from '../dtos/accept-finding.request.dto';
import { FindingListItemDto } from '../dtos/finding-list-item.dto';

@ApiTags('findings')
@Controller('findings')
export class FindingsController {
  public constructor(
    private readonly listFindings: ListFindings,
    private readonly acceptFinding: AcceptFinding,
    private readonly mitigateFinding: MitigateFinding,
  ) {}

  @Get()
  @ApiOkResponse({
    type: [FindingListItemDto],
    description: 'The prioritized findings worklist, ranked by risk score.',
  })
  public list(): Promise<FindingListItem[]> {
    return this.listFindings.execute();
  }

  @Post(':id/accept')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'The risk of the finding was accepted.' })
  public async accept(
    @Param('id') id: string,
    @Body() body: AcceptFindingRequestDto,
  ): Promise<void> {
    await this.acceptFinding.execute({
      findingId: id,
      owner: body.owner ?? 'current-user',
      justification: body.justification,
    });
  }

  @Post(':id/mitigate')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'The finding was marked as mitigated.' })
  public async mitigate(@Param('id') id: string): Promise<void> {
    await this.mitigateFinding.execute({ findingId: id });
  }
}
