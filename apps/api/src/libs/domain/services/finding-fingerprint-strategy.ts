import { FindingFingerprint } from '../value-objects/finding-fingerprint';

/**
 * The material a strategy hashes into a deduplication key. Assembled by the
 * {@link Finding} from its own fields plus catalog context (identifiers, CWE)
 * that lives on the {@link VulnerabilityDefinition}.
 */
export interface FindingFingerprintInput {
  readonly assetId: string;
  /** Canonical vulnerability identifier strings, e.g. ["CVE:CVE-2021-44228"]. */
  readonly vulnerabilityIdentifiers: readonly string[];
  readonly cwe: number | null;
  readonly title: string;
  /** Stable descriptor of the finding location (see FindingLocation.descriptor). */
  readonly locationDescriptor: string;
  readonly uniqueIdFromTool: string | null;
}

/**
 * Port for computing a finding's deduplication {@link FindingFingerprint}. THE
 * dedup seam. Different sources warrant different keys (by tool id, by a hash of
 * identifiers + location, or a combination); this interface lets us support any
 * of them without baking one into the domain.
 */
export interface FindingFingerprintStrategy {
  fingerprint(input: FindingFingerprintInput): FindingFingerprint;
}
