import { InvalidArgumentError } from '../../domain';
import { NotFoundError } from '../errors/not-found.error';
import { Clock } from '../ports/clock';
import { ConnectorCatalog } from '../ports/connector-catalog';
import { IdGenerator } from '../ports/id-generator';
import { SourceRegistry } from '../ports/source-registry';
import { SourceListItem } from '../read-models/source-list-item.read-model';

/** Input for {@link RegisterSource} — a write command. */
export interface RegisterSourceCommand {
  connectorKey: string;
  name: string;
  config: Record<string, unknown>;
}

/**
 * Configure a new connector instance (source): validate the chosen connector and
 * its required config fields against the catalog, then persist the registration.
 */
export class RegisterSource {
  public constructor(
    private readonly catalog: ConnectorCatalog,
    private readonly registry: SourceRegistry,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  public async execute(command: RegisterSourceCommand): Promise<SourceListItem> {
    const name = command.name.trim();
    if (name.length === 0) {
      throw new InvalidArgumentError('A source name is required.');
    }

    const descriptor = await this.catalog.find(command.connectorKey);
    if (descriptor === null) {
      throw new NotFoundError(`Unknown connector "${command.connectorKey}".`);
    }

    for (const field of descriptor.configFields) {
      if (!field.required) {
        continue;
      }
      const value = command.config[field.name];
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new InvalidArgumentError(`Config field "${field.name}" is required.`);
      }
    }

    return this.registry.register({
      id: this.ids.generate(),
      name,
      connectorKey: descriptor.key,
      sourceType: descriptor.sourceType,
      config: command.config,
      now: this.clock.now(),
    });
  }
}
