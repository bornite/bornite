/** Which connector drives a source, plus its (secret) settings. */
export interface ConnectorConfig {
  readonly connectorKey: string;
  readonly settings: Readonly<Record<string, unknown>>;
}

/**
 * Port for resolving a source's connector binding and credentials. Kept separate
 * from the domain `Source` on purpose — secrets never live in the domain model.
 * A real adapter reads from a secrets manager / encrypted column.
 */
export interface ConnectorConfigStore {
  get(sourceId: string): Promise<ConnectorConfig | null>;
}
