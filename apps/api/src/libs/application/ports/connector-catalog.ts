import { ConnectorDescriptor } from '../read-models/connector-descriptor.read-model';

/**
 * Catalog of connector types available to configure. Backed by a static list of
 * the registered connectors and their config fields. DI token in `di-tokens.ts`.
 */
export interface ConnectorCatalog {
  list(): Promise<ConnectorDescriptor[]>;
  find(key: string): Promise<ConnectorDescriptor | null>;
}
