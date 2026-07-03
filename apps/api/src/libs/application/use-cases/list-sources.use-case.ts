import { SourceRegistry } from '../ports/source-registry';
import { SourceListItem } from '../read-models/source-list-item.read-model';

/** List the configured connector instances (sources). */
export class ListSources {
  public constructor(private readonly registry: SourceRegistry) {}

  public execute(): Promise<SourceListItem[]> {
    return this.registry.list();
  }
}
