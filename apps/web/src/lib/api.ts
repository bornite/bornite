import type { Finding } from "./findings";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchFindings(): Promise<Finding[]> {
  const response = await fetch(`${API_URL}/findings`);
  if (!response.ok) {
    throw new Error(`Failed to load findings (${response.status})`);
  }
  return (await response.json()) as Finding[];
}
