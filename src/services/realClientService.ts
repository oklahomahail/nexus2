import { apiClient } from "@/services/apiClient";

// Types matching backend Prisma schema
export interface ClientData {
  id: string;
  name: string;
  shortName?: string; // Add missing shortName
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  description?: string | null;
  primaryContactName?: string; // Add missing field
  primaryContactEmail?: string; // Add missing field
  notes?: string; // Add missing field
  isActive: boolean;
  createdAt: string; // ISO date string from API
  updatedAt: string; // ISO date string from API
  userId: string;
  // Add brand support
  brand?: {
    logoUrl?: string;
  };
  // Relations from backend include
  _count?: {
    campaigns: number;
    donors: number;
  };
  campaigns?: Array<{
    id: string;
    name: string;
    status: string;
    goalAmount: number | null;
    raisedAmount: number;
  }>;
  donors?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    totalDonated: number;
  }>;
}

export type CreateClientData = {
  name: string;
  shortName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  description?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  notes?: string;
};

export type UpdateClientData = Partial<CreateClientData>;

// Backward compatibility
export type Client = ClientData;

export const realClientService = {
  async getAllClients(): Promise<ClientData[]> {
    try {
      const response = await apiClient.get<{ clients: ClientData[] }>(
        "/clients",
      );
      return response.clients;
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      throw error;
    }
  },

  async getClientById(id: string): Promise<ClientData> {
    try {
      const response = await apiClient.get<{ client: ClientData }>(
        `/clients/${id}`,
      );
      return response.client;
    } catch (error) {
      console.error(`Failed to fetch client ${id}:`, error);
      throw error;
    }
  },

  async createClient(clientData: CreateClientData): Promise<ClientData> {
    try {
      const response = await apiClient.post<{ client: ClientData }>(
        "/clients",
        clientData,
      );
      return response.client;
    } catch (error) {
      console.error("Failed to create client:", error);
      throw error;
    }
  },

  async updateClient(
    id: string,
    clientData: UpdateClientData,
  ): Promise<ClientData> {
    try {
      const response = await apiClient.put<{ client: ClientData }>(
        `/clients/${id}`,
        clientData,
      );
      return response.client;
    } catch (error) {
      console.error(`Failed to update client ${id}:`, error);
      throw error;
    }
  },

  async deleteClient(id: string): Promise<void> {
    try {
      await apiClient.delete(`/clients/${id}`);
    } catch (error) {
      console.error(`Failed to delete client ${id}:`, error);
      throw error;
    }
  },

  // Backward compatibility aliases
  async getAll(): Promise<ClientData[]> {
    return this.getAllClients();
  },

  async list(): Promise<ClientData[]> {
    return this.getAllClients();
  },

  async getById(id: string): Promise<ClientData | undefined> {
    try {
      return await this.getClientById(id);
    } catch (error) {
      // Return undefined instead of throwing for backward compatibility
      if (error instanceof Error && error.message.includes("not found")) {
        return undefined;
      }
      throw error;
    }
  },

  async create(clientData: CreateClientData): Promise<ClientData> {
    return this.createClient(clientData);
  },

  async update(
    id: string,
    clientData: UpdateClientData,
  ): Promise<ClientData | undefined> {
    try {
      return await this.updateClient(id, clientData);
    } catch (error) {
      // Return undefined instead of throwing for backward compatibility
      if (error instanceof Error && error.message.includes("not found")) {
        return undefined;
      }
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await this.deleteClient(id);
      return true;
    } catch (error) {
      // Return false instead of throwing for backward compatibility
      if (error instanceof Error && error.message.includes("not found")) {
        return false;
      }
      throw error;
    }
  },
};
