// src/services/database/index.ts
// Barrel exports for database services

export * from "./indexedDbService";
export * from "./persistentCampaignService";
export * from "./persistentClientService";

// Export the main database initialization function
export { initDatabase, closeDatabase } from "./indexedDbService";
