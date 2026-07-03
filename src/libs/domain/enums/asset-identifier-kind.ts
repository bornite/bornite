/**
 * The way an asset is named/addressed. An {@link Asset} may carry several of these
 * (e.g. a host known by both hostname and IP); they are the raw material for asset
 * matching/deduplication across scans.
 */
export enum AssetIdentifierKind {
  Hostname = 'HOSTNAME',
  Fqdn = 'FQDN',
  IpV4 = 'IPV4',
  IpV6 = 'IPV6',
  MacAddress = 'MAC_ADDRESS',
  /** Container image reference or digest, e.g. `sha256:...`. */
  ImageDigest = 'IMAGE_DIGEST',
  /** Source repository URL / slug. */
  RepositoryUrl = 'REPOSITORY_URL',
  /** Cloud resource id / ARN. */
  CloudResourceId = 'CLOUD_RESOURCE_ID',
  /** Opaque external id supplied by a source system. */
  ExternalId = 'EXTERNAL_ID',
}
