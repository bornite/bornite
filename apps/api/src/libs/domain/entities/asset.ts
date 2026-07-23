import { AssetCriticality } from '../enums/asset-criticality';
import { AssetType } from '../enums/asset-type';
import { AggregateRoot } from '../shared/aggregate-root';
import { InvalidArgumentError } from '../shared/domain-error';
import { AssetId } from '../shared/identifiers';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';
import { AssetIdentifier } from '../value-objects/asset-identifier';

export interface AssetProps {
  type: AssetType;
  name: string;
  identifiers: AssetIdentifier[];
  criticality: AssetCriticality;
  owner: string | null;
  tags: string[];
  firstSeenAt: Date;
  lastSeenAt: Date;
  decommissionedAt: Date | null;
  createdAt: Date;
}

export interface CreateAssetInput {
  type: AssetType;
  name: string;
  identifiers: AssetIdentifier[];
  criticality?: AssetCriticality;
  owner?: string;
  tags?: string[];
  now: Date;
}

/**
 * Something worth securing — a host, web app, container, repository or cloud
 * resource — generalising the web-centric "endpoint" of legacy tools. Assets are the
 * long-lived inventory an RBVM platform prioritises against; they exist and
 * persist independently of any scan.
 *
 * Identity is the surrogate id, but assets carry one or more
 * {@link AssetIdentifier}s used to recognise the same real-world thing across
 * scans (the asset-matching seam). Aggregate root.
 */
export class Asset extends AggregateRoot<AssetProps> {
  private constructor(props: AssetProps, id: AssetId) {
    super(props, id);
  }

  public static create(input: CreateAssetInput, id: AssetId): Asset {
    if (input.identifiers.length === 0) {
      throw new InvalidArgumentError('An asset needs at least one identifier.');
    }
    return new Asset(
      {
        type: input.type,
        name: parse(nonEmptyString, input.name, 'Asset name'),
        identifiers: Asset.dedupeIdentifiers(input.identifiers),
        criticality: input.criticality ?? AssetCriticality.Medium,
        owner: input.owner?.trim() || null,
        tags: input.tags ?? [],
        firstSeenAt: input.now,
        lastSeenAt: input.now,
        decommissionedAt: null,
        createdAt: input.now,
      },
      id,
    );
  }

  public static reconstitute(props: AssetProps, id: AssetId): Asset {
    return new Asset(props, id);
  }

  public get type(): AssetType {
    return this.props.type;
  }

  public get name(): string {
    return this.props.name;
  }

  public get criticality(): AssetCriticality {
    return this.props.criticality;
  }

  public get tags(): readonly string[] {
    return this.props.tags;
  }

  public get identifiers(): readonly AssetIdentifier[] {
    return this.props.identifiers;
  }

  public primaryIdentifier(): AssetIdentifier {
    return this.props.identifiers[0]!;
  }

  public hasIdentifier(identifier: AssetIdentifier): boolean {
    return this.props.identifiers.some((i) => i.canonical() === identifier.canonical());
  }

  /** True when the two assets share at least one identifier — the matching rule. */
  public sharesIdentifierWith(other: Asset): boolean {
    const mine = new Set(this.props.identifiers.map((i) => i.canonical()));
    return other.props.identifiers.some((i) => mine.has(i.canonical()));
  }

  public addIdentifier(identifier: AssetIdentifier): void {
    if (!this.hasIdentifier(identifier)) {
      this.props.identifiers.push(identifier);
    }
  }

  public changeCriticality(criticality: AssetCriticality): void {
    this.props.criticality = criticality;
  }

  public rename(name: string): void {
    this.props.name = parse(nonEmptyString, name, 'Asset name');
  }

  public isActive(): boolean {
    return this.props.decommissionedAt === null;
  }

  public recordSeen(at: Date): void {
    if (at > this.props.lastSeenAt) {
      this.props.lastSeenAt = at;
    }
  }

  public decommission(at: Date): void {
    this.props.decommissionedAt = at;
  }

  private static dedupeIdentifiers(identifiers: AssetIdentifier[]): AssetIdentifier[] {
    const seen = new Set<string>();
    const out: AssetIdentifier[] = [];
    for (const id of identifiers) {
      const key = id.canonical();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(id);
      }
    }
    return out;
  }
}
