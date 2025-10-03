// src/services/clientService.ts
// Re-export from real service for backend integration
export * from "./realClientService";
export { realClientService as clientService } from "./realClientService";

import { realClientService } from "./realClientService";

// Add missing exports for backward compatibility
export const listClients = () => realClientService.getAllClients();
export const deleteClient = (id: string) => realClientService.delete(id);
export const createClient = (data: any) => realClientService.createClient(data);
export const updateClient = (id: string, data: any) =>
  realClientService.updateClient(id, data);
