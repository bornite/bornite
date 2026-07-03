import { z } from 'zod';

/**
 * Connector settings for classic Checkmarx CxSAST (on-prem). Auth mirrors the
 * Checkmarx Python SDK: OAuth2 password grant with the well-known public client
 * `resource_owner_client` and its default secret (overridable if the admin
 * created a custom OIDC client).
 */
export const checkmarxSastConfigSchema = z.object({
  /** CxSAST server base URL, e.g. https://cxsast.example.com (no /cxrestapi). */
  baseUrl: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  clientId: z.string().min(1).default('resource_owner_client'),
  clientSecret: z.string().min(1).default('014DF517-39D1-4453-B7B3-9930C563627C'),
});

export type CheckmarxSastConfig = z.infer<typeof checkmarxSastConfigSchema>;

export function parseCheckmarxSastConfig(input: unknown): CheckmarxSastConfig {
  return checkmarxSastConfigSchema.parse(input);
}
