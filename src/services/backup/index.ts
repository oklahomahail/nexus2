// src/services/backup/index.ts

// Public, curated API from backupService
export {
  getBackups,
  saveBackup,
  restoreBackup,
  deleteBackup,
} from "./backupService";

export type {
  Backup,
  BackupManager,
  BackupManagerState,
  BackupEnvelope,
} from "./backupService";

// StorageService – re-export the actual instance and its types
export { storageService } from "./storageService";
export type {
  WritingData,
  ProjectSettings,
  WritingSession,
} from "./storageService";

// Internals namespaced to avoid symbol collisions
export * as core from "./backupCore";
export * as idb from "./indexedDbBackupService";
export { getBackupStatus } from "./backupService";
export { ensureBackupDb } from "./backupService";
export { createManualBackup } from "./backupService";
