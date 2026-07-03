import {
  AssetIdentifierKind,
  VulnerabilitySystem,
} from '../../../../libs/domain';

/**
 * Plain JSON shapes stored in `jsonb` columns. These are the persistence-side
 * representation of the domain's value objects — deliberately dumb records with
 * no behaviour. Mappers convert between these and the real value objects.
 */

export interface AssetIdentifierRecord {
  kind: AssetIdentifierKind;
  value: string;
}

export interface VulnerabilityIdentifierRecord {
  system: VulnerabilitySystem;
  value: string;
}

export interface CweRecord {
  id: number;
  name: string | null;
}

export interface CvssRecord {
  version: string;
  vector: string;
  baseScore: number | null;
}

export interface EpssRecord {
  probability: number;
  percentile: number;
}

export interface FindingLocationRecord {
  filePath: string | null;
  line: number | null;
  symbol: string | null;
  endpoint: string | null;
  port: string | null;
}

export interface ImportCountsRecord {
  created: number;
  reactivated: number;
  closed: number;
  untouched: number;
}
