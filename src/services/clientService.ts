// src/services/clientService.ts
// Client service - Supabase-first implementation

export type { Client } from "@/types/client";

// Placeholder service - implement with Supabase calls
export const clientService = {
  list: async () => {
    // TODO: Implement with Supabase
    return [];
  },
  getAllClients: async () => {
    // TODO: Implement with Supabase
    return [];
  },
  delete: async (id: string) => {
    // TODO: Implement with Supabase
    console.log("Delete client:", id);
  },
  createClient: async (data: any) => {
    // TODO: Implement with Supabase
    console.log("Create client:", data);
  },
  updateClient: async (id: string, data: any) => {
    // TODO: Implement with Supabase
    console.log("Update client:", id, data);
  },
};

// Add missing exports for backward compatibility
export const listClients = () => clientService.getAllClients();
export const deleteClient = (id: string) => clientService.delete(id);
export const createClient = (data: any) => clientService.createClient(data);
export const updateClient = (id: string, data: any) =>
  clientService.updateClient(id, data);
