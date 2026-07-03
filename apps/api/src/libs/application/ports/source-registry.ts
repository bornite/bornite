import { SourceListItem } from '../read-models/source-list-item.read-model';

export interface SourceRegistrationInput {
  id: string;
  name: string;
  connectorKey: string;
  sourceType: string;
  /** Connector settings/credentials. Stored by the adapter; never returned in lists. */
  config: Readonly<Record<string, unknown>>;
  now: Date;
}

/**
 * Store of configured connector instances (sources). Read + write for the
 * connectors UI. DI token in `di-tokens.ts`.
 */
export interface SourceRegistry {
  list(): Promise<SourceListItem[]>;
  register(input: SourceRegistrationInput): Promise<SourceListItem>;
}
