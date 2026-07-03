/**
 * Documentation-only type aliases for aggregate identifiers.
 *
 * Cross-aggregate references are held by id (a plain string), never by object
 * reference, so each aggregate can be loaded and persisted independently. These
 * aliases make the *intent* of a string field explicit at call sites without the
 * ceremony of branded types.
 */
export type AssetId = string;
export type VulnerabilityDefinitionId = string;
export type FindingId = string;
export type SourceId = string;
export type ScanImportId = string;
export type AssessmentId = string;
export type RiskAcceptanceId = string;
export type FindingGroupId = string;
