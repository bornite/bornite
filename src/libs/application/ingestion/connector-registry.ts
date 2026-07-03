import { Connector } from './connector';

/** Lookup of available connectors by key. */
export interface ConnectorRegistry {
  get(key: string): Connector | null;
  all(): readonly Connector[];
}

/** Default in-memory registry. Connectors are registered at composition time. */
export class InMemoryConnectorRegistry implements ConnectorRegistry {
  private readonly connectors = new Map<string, Connector>();

  public constructor(connectors: readonly Connector[] = []) {
    for (const connector of connectors) {
      this.register(connector);
    }
  }

  public register(connector: Connector): void {
    this.connectors.set(connector.key, connector);
  }

  public get(key: string): Connector | null {
    return this.connectors.get(key) ?? null;
  }

  public all(): readonly Connector[] {
    return [...this.connectors.values()];
  }
}
