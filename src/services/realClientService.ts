import { apiClient } from "@/config/api";
import { APIResponse } from "@/config/api";

// Types matching backend Prisma schema
export interface ClientData {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string; // ISO date string from API
  updatedAt: string; // ISO date string from API
  userId: string;
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
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  description?: string;
};

export type UpdateClientData = Partial<CreateClientData>;

// Backward compatibility
export type Client = ClientData;

export const realClientService = {
  async getAllClients(): Promise<ClientData[]> {
    const response =
      await apiClient.get<APIResponse<{ clients: ClientData[] }>>(
        "/api/clients",
      );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch clients");
    }

    return response.data.data.clients;
  },

  async getClientById(id: string): Promise<ClientData> {
    const response = await apiClient.get<APIResponse<{ client: ClientData }>>(
      `/api/clients/${id}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch client");
    }

    return response.data.data.client;
  },

  async createClient(clientData: CreateClientData): Promise<ClientData> {
    const response = await apiClient.post<APIResponse<{ client: ClientData }>>(
      "/api/clients",
      clientData,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create client");
    }

    return response.data.data.client;
  },

  async updateClient(
    id: string,
    clientData: UpdateClientData,
  ): Promise<ClientData> {
    const response = await apiClient.put<APIResponse<{ client: ClientData }>>(
      `/api/clients/${id}`,
      clientData,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update client");
    }

    return response.data.data.client;
  },

  async deleteClient(id: string): Promise<void> {
    const response = await apiClient.delete<APIResponse<{}>>(
      `/api/clients/${id}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete client");
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
