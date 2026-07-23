import { Body, Controller, Get, Inject, NotFoundException, Post, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  GetActivePriorityScheme,
  ID_GENERATOR,
  IdGenerator,
  PreviewRuleCondition,
  RevisePriorityScheme,
} from '../../../application';
import {
  PriorityLevel,
  PriorityRule,
  PriorityScheme,
  RevisePrioritySchemeInput,
  RuleCondition,
} from '../../../domain';
import { PreviewPriorityRequestDto, PreviewPriorityResponseDto } from '../dtos/preview-priority.request.dto';
import { PrioritySchemeDto } from '../dtos/priority-scheme.dto';
import { RevisePrioritySchemeRequestDto } from '../dtos/revise-priority-scheme.request.dto';

/**
 * The configurable-priority admin surface: read the active scheme, revise it, and
 * preview a rule condition against sample facts. Raw request bodies are turned into
 * domain value objects here (the edge); their validation errors flow to the global
 * filter as 400s.
 */
@ApiTags('priority-scheme')
@Controller('priority-scheme')
export class PrioritySchemeController {
  public constructor(
    private readonly getActive: GetActivePriorityScheme,
    private readonly revise: RevisePriorityScheme,
    private readonly preview: PreviewRuleCondition,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  @Get()
  @ApiOkResponse({ type: PrioritySchemeDto, description: 'The active priority scheme.' })
  public async get(): Promise<PrioritySchemeDto> {
    const scheme = await this.getActive.execute();
    if (scheme === null) {
      throw new NotFoundException('No active priority scheme is configured.');
    }
    return this.toDto(scheme);
  }

  @Put()
  @ApiOkResponse({ type: PrioritySchemeDto, description: 'The updated priority scheme.' })
  public async put(@Body() body: RevisePrioritySchemeRequestDto): Promise<PrioritySchemeDto> {
    const scheme = await this.revise.execute(this.toReviseInput(body));
    return this.toDto(scheme);
  }

  @Post('preview')
  @ApiOkResponse({
    type: PreviewPriorityResponseDto,
    description: 'Whether the supplied condition matches the sample facts.',
  })
  public previewCondition(@Body() body: PreviewPriorityRequestDto): PreviewPriorityResponseDto {
    return this.preview.evaluate(body.condition, body.facts);
  }

  private toReviseInput(body: RevisePrioritySchemeRequestDto): RevisePrioritySchemeInput {
    const input: RevisePrioritySchemeInput = {};
    if (body.name !== undefined) {
      input.name = body.name;
    }
    if (body.defaultLevelKey !== undefined) {
      input.defaultLevelKey = body.defaultLevelKey;
    }
    if (body.active !== undefined) {
      input.active = body.active;
    }
    if (body.levels !== undefined) {
      input.levels = body.levels.map((l) =>
        PriorityLevel.of({ key: l.key, label: l.label, rank: l.rank, color: l.color ?? null, slaDays: l.slaDays ?? null }),
      );
    }
    if (body.rules !== undefined) {
      input.rules = body.rules.map((r) =>
        PriorityRule.of({
          id: r.id ?? this.ids.generate(),
          name: r.name,
          levelKey: r.levelKey,
          condition: RuleCondition.fromData(r.condition),
          enabled: r.enabled,
        }),
      );
    }
    return input;
  }

  private toDto(scheme: PriorityScheme): PrioritySchemeDto {
    return {
      id: scheme.id,
      name: scheme.name,
      active: scheme.active,
      version: scheme.version,
      defaultLevelKey: scheme.defaultLevelKey,
      levels: scheme.levels.map((l) => ({
        key: l.key,
        label: l.label,
        rank: l.rank,
        color: l.color,
        slaDays: l.slaDays,
      })),
      rules: scheme.rules.map((r) => ({
        id: r.id,
        name: r.name,
        levelKey: r.levelKey,
        enabled: r.enabled,
        condition: r.condition.data,
      })),
    };
  }
}
