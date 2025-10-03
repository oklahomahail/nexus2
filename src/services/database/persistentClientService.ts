// src/services/database/persistentClientService.ts
// Client service with IndexedDB persistence

import { v4 as uuidv4 } from "uuid";

import { indexedDbService, STORES, DatabaseError } from "./indexedDbService";

// Client interface (same as existing)
export interface Client {
  id: string;
  name: string;
  shortName?: string;
  website?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  notes?: string;
  brand?: {
    logoUrl?: string;
  };
  createdAt: number;
  updatedAt: number;
}

// Type aliases for form data
export type CreateClientData = Omit<Client, "id" | "createdAt" | "updatedAt">;
export type UpdateClientData = Partial<CreateClientData>;

// Helper function to simulate API delay (can be removed later)
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock data for initial seeding
const getMockClients = (): Client[] => [
  {
    id: "acme",
    name: "Acme Nonprofit",
    shortName: "Acme",
    website: "https://acmenonprofit.org",
    primaryContactName: "Jane Smith",
    primaryContactEmail: "jane@acmenonprofit.org",
    notes: "Focused on education and community development",
    brand: {
      logoUrl: "/logos/acme-logo.png",
    },
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
  },
  {
    id: "green-future",
    name: "Green Future Foundation",
    shortName: "Green Future",
    website: "https://greenfuture.org",
    primaryContactName: "Mike Johnson",
    primaryContactEmail: "mike@greenfuture.org",
    notes: "Environmental conservation and sustainability projects",
    brand: {
      logoUrl: "/logos/green-future-logo.png",
    },
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
    updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
  },
  {
    id: "community-care",
    name: "Community Care Alliance",
    shortName: "Community Care",
    website: "https://communitycare.org",
    primaryContactName: "Sarah Williams",
    primaryContactEmail: "sarah@communitycare.org",
    notes: "Healthcare and social services for underserved communities",
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
    updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
  },
];

// Initialize database with mock data if empty
let initialized = false;

const ensureInitialized = async (): Promise<void> => {
  if (initialized) return;

  try {
    await indexedDbService.init();

    // Check if we have any clients, if not seed with mock data
    const existingClients = await indexedDbService.getAll(STORES.CLIENTS);
    if (existingClients.length === 0) {
      console.log("Seeding database with mock clients...");
      await indexedDbService.putMany(STORES.CLIENTS, getMockClients());
    }

    initialized = true;
  } catch (error) {
    console.error("Failed to initialize client database:", error);
    throw new DatabaseError("Client database initialization failed");
  }
};

// Persistent Client Service Implementation
export const clientService = {
  // Get all clients
  async getAll(): Promise<Client[]> {
    await delay(300);
    await ensureInitialized();

    try {
      return await indexedDbService.getAll(STORES.CLIENTS);
    } catch (error) {
      console.error("Error getting all clients:", error);
      throw new DatabaseError("Failed to retrieve clients");
    }
  },

  // Get a single client by ID
  async getById(id: string): Promise<Client | undefined> {
    await delay(200);
    await ensureInitialized();

    try {
      const client = await indexedDbService.get(STORES.CLIENTS, id);
      return client;
    } catch (error) {
      console.error("Error getting client by ID:", error);
      throw new DatabaseError("Failed to retrieve client");
    }
  },

  // Create a new client
  async create(data: CreateClientData): Promise<Client> {
    await delay(500);
    await ensureInitialized();

    const newClient: Client = {
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...data,
    };

    try {
      await indexedDbService.put(STORES.CLIENTS, newClient);
      return newClient;
    } catch (error) {
      console.error("Error creating client:", error);
      throw new DatabaseError("Failed to create client");
    }
  },

  // Update an existing client
  async update(
    id: string,
    updates: Partial<Client>,
  ): Promise<Client | undefined> {
    await delay(500);
    await ensureInitialized();

    try {
      const existingClient = await indexedDbService.get(STORES.CLIENTS, id);
      if (!existingClient) return undefined;

      const updatedClient: Client = {
        ...existingClient,
        ...updates,
        updatedAt: Date.now(),
      };

      await indexedDbService.put(STORES.CLIENTS, updatedClient);
      return updatedClient;
    } catch (error) {
      console.error("Error updating client:", error);
      throw new DatabaseError("Failed to update client");
    }
  },

  // Delete a client
  async delete(id: string): Promise<boolean> {
    await delay(500);
    await ensureInitialized();

    try {
      const existingClient = await indexedDbService.get(STORES.CLIENTS, id);
      if (!existingClient) return false;

      await indexedDbService.delete(STORES.CLIENTS, id);
      return true;
    } catch (error) {
      console.error("Error deleting client:", error);
      throw new DatabaseError("Failed to delete client");
    }
  },

  // Clear all clients (use with caution)
  async clear(): Promise<void> {
    await delay(200);
    await ensureInitialized();

    try {
      await indexedDbService.clear(STORES.CLIENTS);
    } catch (error) {
      console.error("Error clearing clients:", error);
      throw new DatabaseError("Failed to clear clients");
    }
  },

  // Add async list method for consistency with component expectations
  async list(): Promise<Client[]> {
    return this.getAll();
  },

  // Search clients by name
  async search(query: string): Promise<Client[]> {
    await delay(300);
    await ensureInitialized();

    try {
      const clients = await this.getAll();
      const lowercaseQuery = query.toLowerCase();

      return clients.filter(
        (client) =>
          client.name.toLowerCase().includes(lowercaseQuery) ||
          client.shortName?.toLowerCase().includes(lowercaseQuery) ||
          client.primaryContactName?.toLowerCase().includes(lowercaseQuery),
      );
    } catch (error) {
      console.error("Error searching clients:", error);
      throw new DatabaseError("Failed to search clients");
    }
  },

  // Get clients sorted by creation date
  async getRecent(limit: number = 10): Promise<Client[]> {
    await delay(200);
    await ensureInitialized();

    try {
      const clients = await this.getAll();
      return clients.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
    } catch (error) {
      console.error("Error getting recent clients:", error);
      throw new DatabaseError("Failed to retrieve recent clients");
    }
  },

  // Export data for backup
  async exportData(): Promise<Client[]> {
    await ensureInitialized();
    return this.getAll();
  },

  // Import data from backup
  async importData(clients: Client[]): Promise<void> {
    await ensureInitialized();

    try {
      await indexedDbService.clear(STORES.CLIENTS);
      if (clients.length > 0) {
        await indexedDbService.putMany(STORES.CLIENTS, clients);
      }
    } catch (error) {
      console.error("Error importing clients:", error);
      throw new DatabaseError("Failed to import clients");
    }
  },
};

// Wrapper Functions for compatibility with existing components
export const listClients = async (): Promise<Client[]> => {
  return clientService.getAll();
};

export const createClient = async (data: CreateClientData): Promise<Client> => {
  return clientService.create(data);
};

export const updateClient = async (
  id: string,
  updates: UpdateClientData,
): Promise<Client | undefined> => {
  return clientService.update(id, updates);
};

export const deleteClient = async (id: string): Promise<boolean> => {
  return clientService.delete(id);
};

export const getClientById = async (
  id: string,
): Promise<Client | undefined> => {
  return clientService.getById(id);
};

export const searchClients = async (query: string): Promise<Client[]> => {
  return clientService.search(query);
};

// Keep the existing type export for backward compatibility
export type { Client as ClientType };
