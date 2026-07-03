import { SourceType } from '../enums/source-type';
import { AggregateRoot } from '../shared/aggregate-root';
import { SourceId } from '../shared/identifiers';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';

export interface SourceProps {
  name: string;
  type: SourceType;
  vendor: string | null;
  description: string | null;
  enabled: boolean;
  createdAt: Date;
}

export interface CreateSourceInput {
  name: string;
  type: SourceType;
  vendor?: string;
  description?: string;
  now: Date;
}

/** Source types whose findings are, by default, static (code-level) rather than runtime. */
const STATIC_SOURCE_TYPES: readonly SourceType[] = [
  SourceType.Sast,
  SourceType.Sca,
  SourceType.SecretScanner,
  SourceType.IacScanner,
];

/**
 * A tool/technique that produces findings — Nessus, SonarQube, Trivy, a manual
 * pentest, … It unifies the scanner-category and tool-configuration concepts into
 * one registry aggregate. Long-lived reference data; individual
 * ingestions are {@link ScanImport}s that reference a Source.
 */
export class Source extends AggregateRoot<SourceProps> {
  private constructor(props: SourceProps, id: SourceId) {
    super(props, id);
  }

  public static create(input: CreateSourceInput, id: SourceId): Source {
    return new Source(
      {
        name: parse(nonEmptyString, input.name, 'Source name'),
        type: input.type,
        vendor: input.vendor?.trim() || null,
        description: input.description?.trim() || null,
        enabled: true,
        createdAt: input.now,
      },
      id,
    );
  }

  public static reconstitute(props: SourceProps, id: SourceId): Source {
    return new Source(props, id);
  }

  public get name(): string {
    return this.props.name;
  }

  public get type(): SourceType {
    return this.props.type;
  }

  public get enabled(): boolean {
    return this.props.enabled;
  }

  /** Whether findings from this source are static (code) as opposed to dynamic (runtime). */
  public producesStaticFindings(): boolean {
    return STATIC_SOURCE_TYPES.includes(this.props.type);
  }

  public enable(): void {
    this.props.enabled = true;
  }

  public disable(): void {
    this.props.enabled = false;
  }

  public rename(name: string): void {
    this.props.name = parse(nonEmptyString, name, 'Source name');
  }
}
