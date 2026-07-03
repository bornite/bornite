import { AssetIdentifierKind } from '../enums/asset-identifier-kind';
import { InvalidArgumentError } from '../shared/domain-error';
import { parse } from '../shared/parse';
import { nonEmptyString } from '../shared/schemas';
import { ValueObject } from '../shared/value-object';

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const MAC = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;

function normalize(kind: AssetIdentifierKind, trimmed: string): string {
  switch (kind) {
    case AssetIdentifierKind.IpV4: {
      const m = IPV4.exec(trimmed);
      if (!m || m.slice(1).some((octet) => Number(octet) > 255)) {
        throw new InvalidArgumentError(`Invalid IPv4 address: "${trimmed}".`);
      }
      return trimmed;
    }
    case AssetIdentifierKind.MacAddress:
      if (!MAC.test(trimmed)) {
        throw new InvalidArgumentError(`Invalid MAC address: "${trimmed}".`);
      }
      return trimmed.toLowerCase();
    case AssetIdentifierKind.Hostname:
    case AssetIdentifierKind.Fqdn:
    case AssetIdentifierKind.IpV6:
      return trimmed.toLowerCase();
    default:
      return trimmed;
  }
}

/**
 * A way an {@link Asset} is addressed/named (hostname, IP, MAC, image digest,
 * repo URL, cloud id …). Assets can carry several. These are the raw material for
 * matching the same real-world asset across scans, so values are normalised to a
 * canonical form on construction.
 */
export class AssetIdentifier extends ValueObject {
  private constructor(
    public readonly kind: AssetIdentifierKind,
    public readonly value: string,
  ) {
    super();
    Object.freeze(this);
  }

  public static create(kind: AssetIdentifierKind, rawValue: string): AssetIdentifier {
    const trimmed = parse(nonEmptyString, rawValue, `Asset identifier (${kind})`);
    return new AssetIdentifier(kind, normalize(kind, trimmed));
  }

  /** Namespaced canonical form, stable for matching/dedup. */
  public canonical(): string {
    return `${this.kind}:${this.value}`;
  }

  public override toString(): string {
    return this.value;
  }
}
