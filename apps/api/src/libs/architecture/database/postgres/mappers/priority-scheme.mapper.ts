import { PriorityLevel, PriorityRule, PriorityScheme, RuleCondition } from '../../../../domain';
import { PrioritySchemeEntity } from '../entities/priority-scheme.entity';
import { Mapper } from './mapper';

export class PrioritySchemeMapper implements Mapper<PriorityScheme, PrioritySchemeEntity> {
  public toDomain(row: PrioritySchemeEntity): PriorityScheme {
    return PriorityScheme.reconstitute(
      {
        name: row.name,
        levels: row.levels.map((l) =>
          PriorityLevel.of({ key: l.key, label: l.label, rank: l.rank, color: l.color, slaDays: l.slaDays }),
        ),
        rules: row.rules.map((r) =>
          PriorityRule.of({
            id: r.id,
            name: r.name,
            levelKey: r.levelKey,
            condition: RuleCondition.fromData(r.condition),
            enabled: r.enabled,
          }),
        ),
        defaultLevelKey: row.defaultLevelKey,
        active: row.active,
        version: row.version,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      row.id,
    );
  }

  public toOrm(scheme: PriorityScheme): PrioritySchemeEntity {
    const s = scheme.snapshot();
    const row = new PrioritySchemeEntity();
    row.id = scheme.id;
    row.name = s.name;
    row.levels = s.levels.map((l) => ({
      key: l.key,
      label: l.label,
      rank: l.rank,
      color: l.color,
      slaDays: l.slaDays,
    }));
    row.rules = s.rules.map((r) => ({
      id: r.id,
      name: r.name,
      levelKey: r.levelKey,
      enabled: r.enabled,
      condition: r.condition.data,
    }));
    row.defaultLevelKey = s.defaultLevelKey;
    row.active = s.active;
    row.version = s.version;
    row.createdAt = s.createdAt;
    row.updatedAt = s.updatedAt;
    return row;
  }
}
