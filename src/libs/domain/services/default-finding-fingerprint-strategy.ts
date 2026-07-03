import { FindingFingerprint } from '../value-objects/finding-fingerprint';
import { FindingFingerprintInput, FindingFingerprintStrategy } from './finding-fingerprint-strategy';

/**
 * Reference deduplication strategy for Bornite's asset-centric model. It offers
 * the three approaches common to mature scanners:
 *
 * - When the source provides a stable technical id (`uniqueIdFromTool`), that id
 *   scoped to the asset IS the key (the "unique id from tool" approach).
 * - Otherwise the key is a composite of asset + the vulnerability's identifiers +
 *   CWE + location (the "hash code" approach), falling back to the title when no
 *   identifiers are known (the "legacy" approach).
 *
 * The result is a readable composite string, not a digest — see
 * {@link FindingFingerprint}. Persistence may hash it for indexing.
 */
export class DefaultFindingFingerprintStrategy implements FindingFingerprintStrategy {
  public fingerprint(input: FindingFingerprintInput): FindingFingerprint {
    if (input.uniqueIdFromTool && input.uniqueIdFromTool.trim().length > 0) {
      return FindingFingerprint.of(['uid', input.assetId, input.uniqueIdFromTool].join('::'));
    }

    const vulnPart = [...input.vulnerabilityIdentifiers].sort().join(',');
    const parts = [
      'h',
      input.assetId,
      vulnPart.length > 0 ? vulnPart : `title:${input.title}`,
      input.cwe !== null ? `cwe:${input.cwe}` : '',
      input.locationDescriptor,
    ].filter((p) => p.length > 0);

    return FindingFingerprint.of(parts.join('::'));
  }
}
