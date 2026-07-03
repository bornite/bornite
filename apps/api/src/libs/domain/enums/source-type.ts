/**
 * Category of tool/technique that produced findings. Drives default
 * static/dynamic classification and can inform deduplication and risk scoring.
 *
 * Corresponds loosely to a scanner's "test type" / "tool type", but modelled as
 * a closed vocabulary rather than free-text.
 */
export enum SourceType {
  /** Network / infrastructure vulnerability scanner (e.g. Nessus, OpenVAS). */
  NetworkScanner = 'NETWORK_SCANNER',
  /** Static Application Security Testing. */
  Sast = 'SAST',
  /** Dynamic Application Security Testing. */
  Dast = 'DAST',
  /** Software Composition Analysis (dependencies). */
  Sca = 'SCA',
  /** Cloud Security Posture Management. */
  Cspm = 'CSPM',
  /** Container / image scanning. */
  ContainerScanner = 'CONTAINER_SCANNER',
  /** Secret detection. */
  SecretScanner = 'SECRET_SCANNER',
  /** Infrastructure-as-Code scanning. */
  IacScanner = 'IAC_SCANNER',
  /** Manual penetration test / human-reported. */
  Manual = 'MANUAL',
  /** Anything not covered above. */
  Other = 'OTHER',
}
