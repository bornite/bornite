import { SourceListItem, SourceRegistrationInput, SourceRegistry } from '../../application';

/**
 * In-memory implementation of the {@link SourceRegistry}. Holds configured
 * connector instances plus their (secret) config, which is never returned in
 * lists. A stand-in until source registrations are persisted.
 */
export class InMemorySourceRegistry implements SourceRegistry {
  private readonly records = new Map<
    string,
    { item: SourceListItem; config: Readonly<Record<string, unknown>> }
  >();

  public async list(): Promise<SourceListItem[]> {
    return [...this.records.values()].map((record) => record.item);
  }

  public async register(input: SourceRegistrationInput): Promise<SourceListItem> {
    const item: SourceListItem = {
      id: input.id,
      name: input.name,
      connectorKey: input.connectorKey,
      sourceType: input.sourceType,
      enabled: true,
      createdAt: input.now.toISOString(),
    };
    this.records.set(input.id, { item, config: input.config });
    return item;
  }
}
