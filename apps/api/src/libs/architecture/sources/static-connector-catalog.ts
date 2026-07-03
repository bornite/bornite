import { ConnectorCatalog, ConnectorDescriptor } from '../../application';

const CONNECTORS: ConnectorDescriptor[] = [
  {
    key: 'checkmarx-sca',
    label: 'Checkmarx SCA',
    sourceType: 'SCA',
    modes: ['PULL'],
    configFields: [
      { name: 'tenant', label: 'Tenant', type: 'text', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'text', required: false, placeholder: 'https://api-sca.checkmarx.net' },
      { name: 'accessControlUrl', label: 'Access control URL', type: 'text', required: false, placeholder: 'https://platform.checkmarx.net' },
    ],
  },
  {
    key: 'checkmarx-sast',
    label: 'Checkmarx SAST (on-prem)',
    sourceType: 'SAST',
    modes: ['PULL'],
    configFields: [
      { name: 'baseUrl', label: 'Server base URL', type: 'text', required: true, placeholder: 'https://cxsast.example.com' },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'clientId', label: 'OIDC client id', type: 'text', required: false, placeholder: 'resource_owner_client' },
      { name: 'clientSecret', label: 'OIDC client secret', type: 'password', required: false },
    ],
  },
];

/** Static catalog of the built-in connectors and their configuration fields. */
export class StaticConnectorCatalog implements ConnectorCatalog {
  public async list(): Promise<ConnectorDescriptor[]> {
    return CONNECTORS;
  }

  public async find(key: string): Promise<ConnectorDescriptor | null> {
    return CONNECTORS.find((connector) => connector.key === key) ?? null;
  }
}
