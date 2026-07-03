/**
 * Strategy by which findings are clustered into a {@link FindingGroup}.
 */
export enum FindingGroupBy {
  Component = 'COMPONENT',
  ComponentAndVersion = 'COMPONENT_AND_VERSION',
  FilePath = 'FILE_PATH',
  Title = 'TITLE',
  VulnerabilityId = 'VULNERABILITY_ID',
}
