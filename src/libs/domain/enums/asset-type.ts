/**
 * Discriminator for the kind of asset a finding is attached to. Generalises the
 * web-centric "endpoint" of legacy tools into the full range of things an RBVM
 * platform tracks.
 */
export enum AssetType {
  /** A host / server / VM identified by hostname, FQDN or IP. */
  Host = 'HOST',
  /** A web application or API surface (target of DAST). */
  WebApplication = 'WEB_APPLICATION',
  /** A container image or running container. */
  Container = 'CONTAINER',
  /** A source-code repository (target of SAST/SCA/secret scanning). */
  CodeRepository = 'CODE_REPOSITORY',
  /** A cloud resource (target of CSPM), e.g. an S3 bucket or IAM role. */
  CloudResource = 'CLOUD_RESOURCE',
}
