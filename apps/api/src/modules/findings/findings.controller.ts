import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FindingListItemDto } from './dto/finding-list-item.dto';
import { FindingsService } from './findings.service';

@ApiTags('findings')
@Controller('findings')
export class FindingsController {
  public constructor(private readonly findings: FindingsService) {}

  @Get()
  @ApiOkResponse({
    type: [FindingListItemDto],
    description: 'The prioritized findings worklist, ranked by risk score.',
  })
  public list(): FindingListItemDto[] {
    return this.findings.list();
  }
}
