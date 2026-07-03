import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  ConnectorDescriptor,
  ListConnectors,
  ListSources,
  RegisterSource,
  SourceListItem,
} from '../../../application';
import { ConnectorDescriptorDto } from '../dtos/connector-descriptor.dto';
import { RegisterSourceRequestDto } from '../dtos/register-source.request.dto';
import { SourceListItemDto } from '../dtos/source-list-item.dto';

@ApiTags('connectors')
@Controller()
export class SourcesController {
  public constructor(
    private readonly listConnectors: ListConnectors,
    private readonly listSources: ListSources,
    private readonly registerSource: RegisterSource,
  ) {}

  @Get('connectors')
  @ApiOkResponse({ type: [ConnectorDescriptorDto], description: 'Available connector types.' })
  public connectors(): Promise<ConnectorDescriptor[]> {
    return this.listConnectors.execute();
  }

  @Get('sources')
  @ApiOkResponse({ type: [SourceListItemDto], description: 'Configured connector instances.' })
  public sources(): Promise<SourceListItem[]> {
    return this.listSources.execute();
  }

  @Post('sources')
  @ApiCreatedResponse({ type: SourceListItemDto, description: 'The registered source.' })
  public register(@Body() body: RegisterSourceRequestDto): Promise<SourceListItem> {
    return this.registerSource.execute({
      connectorKey: body.connectorKey,
      name: body.name,
      config: body.config ?? {},
    });
  }
}
