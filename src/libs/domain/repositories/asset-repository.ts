import { Asset } from '../entities/asset';
import { AssetId } from '../shared/identifiers';
import { AssetIdentifier } from '../value-objects/asset-identifier';
import { Repository } from './repository';

export interface AssetRepository extends Repository<Asset, AssetId> {
  /**
   * Find the asset carrying any of the given identifiers — the asset-matching
   * query used to attach an incoming finding to an existing asset rather than
   * creating a duplicate.
   */
  findByIdentifiers(identifiers: readonly AssetIdentifier[]): Promise<Asset | null>;
}
