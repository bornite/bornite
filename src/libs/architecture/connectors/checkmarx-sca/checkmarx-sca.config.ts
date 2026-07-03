import { z } from 'zod';

/**
 * Connector settings for Checkmarx SCA. Auth mirrors the Checkmarx Python SDK:
 * OAuth2 Resource-Owner-Password-Credentials against the access-control host,
 * with the tenant passed via `acr_values` (no client secret — the public client
 * id `sca_resource_owner` is used).
 */
export const checkmarxScaConfigSchema = z.object({
  tenant: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  apiUrl: z.string().min(1).default('https://api-sca.checkmarx.net'),
  accessControlUrl: z.string().min(1).default('https://platform.checkmarx.net'),
});

export type CheckmarxScaConfig = z.infer<typeof checkmarxScaConfigSchema>;

export function parseCheckmarxScaConfig(input: unknown): CheckmarxScaConfig {
  return checkmarxScaConfigSchema.parse(input);
}
