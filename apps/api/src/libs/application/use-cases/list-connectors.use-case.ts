import { ConnectorCatalog } from '../ports/connector-catalog';
import { ConnectorDescriptor } from '../read-models/connector-descriptor.read-model';

/** List the connector types available to configure. */
export class ListConnectors {
  public constructor(private readonly catalog: ConnectorCatalog) {}

  public execute(): Promise<ConnectorDescriptor[]> {
    return this.catalog.list();
  }
}
