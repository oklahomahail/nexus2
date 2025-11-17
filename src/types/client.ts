// src/types/client.ts

export interface Client {
  id: string;
  name: string;
  shortName?: string; // Optional short display name
  primaryContactName?: string;
  primaryContactEmail?: string;
  notes?: string;

  // Metadata
  createdAt: number;
  updatedAt: number;
}

/**
 * Convert a client name to a URL-safe slug
 * Example: "Regional Food Bank" -> "regional-food-bank"
 */
export function clientNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Get the slug for a client
 */
export function getClientSlug(client: Client): string {
  return clientNameToSlug(client.name);
}
