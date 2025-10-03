// src/services/clientService.ts
// Re-export from real service for backend integration
export * from "./realClientService";
export { realClientService as clientService } from "./realClientService";
