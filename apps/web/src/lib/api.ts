import type { Finding } from "./findings";
import type { ConnectorDescriptor, SourceListItem } from "./connectors";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchFindings(): Promise<Finding[]> {
  const response = await fetch(`${API_URL}/findings`);
  if (!response.ok) {
    throw new Error(`Failed to load findings (${response.status})`);
  }
  return (await response.json()) as Finding[];
}

async function postAction(findingId: string, action: "accept" | "mitigate"): Promise<void> {
  const response = await fetch(`${API_URL}/findings/${findingId}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) {
    throw new Error(`Action "${action}" failed (${response.status})`);
  }
}

export function acceptFinding(findingId: string): Promise<void> {
  return postAction(findingId, "accept");
}

export function mitigateFinding(findingId: string): Promise<void> {
  return postAction(findingId, "mitigate");
}

export async function fetchConnectors(): Promise<ConnectorDescriptor[]> {
  const response = await fetch(`${API_URL}/connectors`);
  if (!response.ok) {
    throw new Error(`Failed to load connectors (${response.status})`);
  }
  return (await response.json()) as ConnectorDescriptor[];
}

export async function fetchSources(): Promise<SourceListItem[]> {
  const response = await fetch(`${API_URL}/sources`);
  if (!response.ok) {
    throw new Error(`Failed to load sources (${response.status})`);
  }
  return (await response.json()) as SourceListItem[];
}

export async function registerSource(input: {
  connectorKey: string;
  name: string;
  config: Record<string, string>;
}): Promise<SourceListItem> {
  const response = await fetch(`${API_URL}/sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Failed to register source (${response.status})`);
  }
  return (await response.json()) as SourceListItem;
}
