import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FindingListItem, ListFindings } from '../../../application';
import { FindingListItemDto } from '../dtos/finding-list-item.dto';

@ApiTags('findings')
@Controller('findings')
export class FindingsController {
  public constructor(private readonly listFindings: ListFindings) {}

  @Get()
  @ApiOkResponse({
    type: [FindingListItemDto],
    description: 'The prioritized findings worklist, ranked by risk score.',
  })
  public list(): Promise<FindingListItem[]> {
    return this.listFindings.execute();
  }
}
