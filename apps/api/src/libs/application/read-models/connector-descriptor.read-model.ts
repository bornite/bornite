/** A single configuration field a connector needs, for rendering an add form. */
export interface ConnectorConfigField {
  name: string;
  label: string;
  type: 'text' | 'password';
  required: boolean;
  placeholder?: string;
}

/** Describes an available connector type in the catalog (for the "add connector" UI). */
export interface ConnectorDescriptor {
  key: string;
  label: string;
  sourceType: string;
  modes: string[];
  configFields: ConnectorConfigField[];
}
