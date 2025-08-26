// src/services/clientService.ts

import { v4 as uuidv4 } from "uuid";

import { storageService } from "@/services/storageService";

// --------------------
// Client Type
// --------------------
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

// --------------------
// Type Aliases for Form Data
// --------------------
export type CreateClientData = Omit<Client, "id" | "createdAt" | "updatedAt">;
export type UpdateClientData = Partial<CreateClientData>;

// --------------------
// Storage Keys
// --------------------
const CLIENTS_KEY = "nexus_clients";

// --------------------
// Service Implementation
// --------------------
export const clientService = {
  // Get all clients
  getAll(): Client[] {
    return storageService.getItem<Client[]>(CLIENTS_KEY) || [];
  },

  // Get a single client by ID
  getById(id: string): Client | undefined {
    return this.getAll().find((c) => c.id === id);
  },

  // Create a new client
  create(data: Omit<Client, "id" | "createdAt" | "updatedAt">): Client {
    const clients = this.getAll();
    const newClient: Client = {
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...data,
    };
    clients.push(newClient);
    storageService.setItem(CLIENTS_KEY, clients);
    return newClient;
  },

  // Update an existing client
  update(id: string, updates: Partial<Client>): Client | undefined {
    const clients = this.getAll();
    const idx = clients.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;

    const updatedClient: Client = {
      ...clients[idx],
      ...updates,
      updatedAt: Date.now(),
    };
    clients[idx] = updatedClient;
    storageService.setItem(CLIENTS_KEY, clients);
    return updatedClient;
  },

  // Delete a client
  delete(id: string): boolean {
    const clients = this.getAll();
    const filtered = clients.filter((c) => c.id !== id);
    if (filtered.length === clients.length) return false;
    storageService.setItem(CLIENTS_KEY, filtered);
    return true;
  },

  // Clear all clients (use with caution)
  clear(): void {
    storageService.removeItem(CLIENTS_KEY);
  },

  // Add async list method for consistency with component expectations
  async list(): Promise<Client[]> {
    return this.getAll();
  },
};

// --------------------
// Wrapper Functions (for compatibility with existing components)
// --------------------

// Async wrapper functions that components expect
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

// Keep the existing type export for backward compatibility
export type { Client as ClientType };
