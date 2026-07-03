/**
 * Business criticality of an {@link Asset}. A first-class risk factor: the same
 * vulnerability on a crown-jewel asset carries more risk than on a throwaway one.
 * Comparable to a product-level "business criticality", but attached at the
 * asset level where RBVM prioritisation actually needs it.
 *
 * The numeric weight is exposed via {@link ASSET_CRITICALITY_WEIGHT} for scoring.
 */
export enum AssetCriticality {
  VeryLow = 'VERY_LOW',
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  VeryHigh = 'VERY_HIGH',
}

/** Normalised weight in [0, 1] used by risk-scoring strategies. */
export const ASSET_CRITICALITY_WEIGHT: Readonly<Record<AssetCriticality, number>> = {
  [AssetCriticality.VeryLow]: 0.2,
  [AssetCriticality.Low]: 0.4,
  [AssetCriticality.Medium]: 0.6,
  [AssetCriticality.High]: 0.8,
  [AssetCriticality.VeryHigh]: 1.0,
};
