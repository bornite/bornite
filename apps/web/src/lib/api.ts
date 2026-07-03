import type { Finding } from "./findings";

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
