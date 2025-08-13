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
