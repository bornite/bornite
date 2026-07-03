/** A configured connector instance (source), as shown in the connectors UI. */
export interface SourceListItem {
  id: string;
  name: string;
  connectorKey: string;
  sourceType: string;
  enabled: boolean;
  createdAt: string;
}
