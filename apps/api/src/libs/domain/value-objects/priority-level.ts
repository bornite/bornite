import { z } from 'zod';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';
import { ValueObject } from '../shared/value-object';

const keySchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,15}$/, 'must be 1–16 chars: letters, digits, "-" or "_"');
const rankSchema = z.number().int().min(0);
const colorSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'must be a hex colour like #a1b2c3');
const slaSchema = z.number().int().min(0);

export interface PriorityLevelInput {
  key: string;
  label: string;
  rank: number;
  color?: string | null;
  slaDays?: number | null;
}

/**
 * One customer-defined priority band (e.g. "P0", "Critical"). Purely descriptive: a
 * stable {@link key}, a human {@link label}, an urgency {@link rank} (higher = more
 * urgent) used to order the worklist, an optional display {@link color}, and an
 * optional remediation {@link slaDays} deadline. The owning {@link PriorityScheme}
 * guarantees keys and ranks are unique across its levels.
 */
export class PriorityLevel extends ValueObject {
  private constructor(
    public readonly key: string,
    public readonly label: string,
    public readonly rank: number,
    public readonly color: string | null,
    public readonly slaDays: number | null,
  ) {
    super();
    Object.freeze(this);
  }

  public static of(input: PriorityLevelInput): PriorityLevel {
    return new PriorityLevel(
      parse(keySchema, input.key, 'Priority level key'),
      parse(nonEmptyString, input.label, 'Priority level label'),
      parse(rankSchema, input.rank, 'Priority level rank'),
      input.color == null ? null : parse(colorSchema, input.color, 'Priority level colour'),
      input.slaDays == null ? null : parse(slaSchema, input.slaDays, 'Priority level SLA (days)'),
    );
  }

  public isMoreUrgentThan(other: PriorityLevel): boolean {
    return this.rank > other.rank;
  }
}
