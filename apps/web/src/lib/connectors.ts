export interface ConnectorConfigField {
  name: string;
  label: string;
  type: "text" | "password";
  required: boolean;
  placeholder?: string;
}

export interface ConnectorDescriptor {
  key: string;
  label: string;
  sourceType: string;
  modes: string[];
  configFields: ConnectorConfigField[];
}

export interface SourceListItem {
  id: string;
  name: string;
  connectorKey: string;
  sourceType: string;
  enabled: boolean;
  createdAt: string;
}
