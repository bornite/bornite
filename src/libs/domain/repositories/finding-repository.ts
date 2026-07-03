import { Finding } from '../entities/finding';
import { AssetId, FindingId } from '../shared/identifiers';
import { FindingFingerprint } from '../value-objects/finding-fingerprint';
import { Repository } from './repository';

export interface FindingRepository extends Repository<Finding, FindingId> {
  /**
   * Find an existing finding with the same fingerprint (optionally scoped to an
   * asset). THE deduplication lookup — returns the incumbent a re-imported
   * finding should merge into, or null if it is new.
   */
  findByFingerprint(fingerprint: FindingFingerprint, assetId?: AssetId): Promise<Finding | null>;

  /** All findings recorded against an asset. */
  findByAsset(assetId: AssetId): Promise<Finding[]>;
}
