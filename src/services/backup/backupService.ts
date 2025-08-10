// src/services/backup/backupService.ts

/** Process status for backup operations */
export type BackupProcessStatus = 'idle' | 'saving' | 'success' | 'error' | 'retrying';

/** Storage quota information */
export interface StorageQuota {
  usage: number; // bytes used
  quota: number; // total bytes available
  usagePercent: number; // percentage used
  warningThreshold: number; // warning threshold percentage
}

/** Overall backup statistics */
export interface BackupStats {
  totalBackups: number;
  totalSize: string;
  totalSizeBytes: number;
  lastBackup: number | null;
  autoBackupEnabled: boolean;
  storageWarning: boolean;
  quota?: StorageQuota;
}

/** State of the BackupManager */
export interface BackupManagerState {
  status: BackupProcessStatus;
  lastSuccess: number | null;
  error: string | null;
  retryCount: number;
  retryDelayMs: number;
}

/** Backup data structure */
export interface Backup {
  id: string;
  type?: 'auto' | 'manual' | 'emergency';
  title?: string;
  description?: string;
  data: unknown;
  timestamp: number;
  size?: number;
  isCorrupted?: boolean;
}

/** Backup item for queuing */
export interface BackupItem {
  type: string;
  id: string;
  payload: unknown;
  priority?: 'low' | 'normal' | 'high';
}

type NotifyFn = (message: string, type?: 'info' | 'success' | 'error') => void;

const BACKUPS_KEY = 'app_backups';
const BACKUP_QUEUE_KEY = 'app_backup_queue';

// Utility functions
export async function getBackups(): Promise<Backup[]> {
  try {
    const json = localStorage.getItem(BACKUPS_KEY);
    if (!json) return [];
    return JSON.parse(json) as Backup[];
  } catch {
    return [];
  }
}

export async function saveBackup(backup: Backup): Promise<void> {
  const backups = await getBackups();
  backups.push(backup);
  
  // Keep only the last 50 backups to prevent storage bloat
  const recentBackups = backups
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);
    
  localStorage.setItem(BACKUPS_KEY, JSON.stringify(recentBackups));
}

export async function restoreBackup(
  id: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const backups = await getBackups();
    const backup = backups.find((b) => b.id === id);
    if (!backup) {
      return { success: false, error: 'Backup not found' };
    }

    // TODO: Implement actual restore logic based on your app's needs
    // This would typically involve restoring the backup.data to your app state
    console.log('Restoring backup:', backup);

    return { success: true, message: 'Backup restored successfully' };
  } catch (error) {
    return {
      success: false,
      error: `Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function deleteBackup(
  id: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    let backups = await getBackups();
    const initialLength = backups.length;
    backups = backups.filter((b) => b.id !== id);

    if (backups.length === initialLength) {
      return { success: false, error: 'Backup not found' };
    }

    localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));
    return { success: true, message: 'Backup deleted successfully' };
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function exportBackup(
  id: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const backups = await getBackups();
    const backup = backups.find((b) => b.id === id);
    if (!backup) return { success: false, error: 'Backup not found' };

    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${backup.id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true, message: 'Backup exported successfully' };
  } catch (error) {
    return {
      success: false,
      error: `Failed to export backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function importBackup(
  file: File,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const text = await file.text();
    const backup: Backup = JSON.parse(text);

    // Validate backup structure
    if (!backup.id || !backup.timestamp || backup.data === undefined) {
      return { success: false, error: 'Invalid backup file format' };
    }

    // Check if backup already exists
    const existingBackups = await getBackups();
    if (existingBackups.some((b) => b.id === backup.id)) {
      return { success: false, error: 'Backup with this ID already exists' };
    }

    await saveBackup(backup);
    return { success: true, message: 'Backup imported successfully' };
  } catch (error) {
    return {
      success: false,
      error: `Failed to import backup: ${error instanceof Error ? error.message : 'Invalid file format'}`,
    };
  }
}

export async function clearAllBackups(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    localStorage.removeItem(BACKUPS_KEY);
    return { success: true, message: 'All backups cleared successfully' };
  } catch (error) {
    return {
      success: false,
      error: `Failed to clear backups: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Storage quota utilities
export async function getStorageQuota(): Promise<StorageQuota | undefined> {
  try {
    // Calculate localStorage usage
    const storage = localStorage;
    let totalSize = 0;
    
    for (let key in storage) {
      if (storage.hasOwnProperty(key)) {
        totalSize += storage[key].length + key.length;
      }
    }

    // Estimate quota (most browsers have ~5-10MB for localStorage)
    const estimatedQuota = 5 * 1024 * 1024; // 5MB
    const usagePercent = (totalSize / estimatedQuota) * 100;

    return {
      usage: totalSize,
      quota: estimatedQuota,
      usagePercent: Math.round(usagePercent * 100) / 100,
      warningThreshold: 80, // Warn at 80%
    };
  } catch (error) {
    console.error('Failed to calculate storage quota:', error);
    return undefined;
  }
}

export async function getBackupStatus(): Promise<BackupStats> {
  const backups = await getBackups();
  const totalSizeBytes = new Blob([JSON.stringify(backups)]).size;
  const quota = await getStorageQuota();

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return {
    totalBackups: backups.length,
    totalSize: formatSize(totalSizeBytes),
    totalSizeBytes,
    lastBackup: backups.length ? Math.max(...backups.map(b => b.timestamp)) : null,
    autoBackupEnabled: autoBackupInterval !== null,
    storageWarning: quota ? quota.usagePercent > quota.warningThreshold : totalSizeBytes > 4 * 1024 * 1024,
    quota,
  };
}

// Queue-based backup system
let backupQueue: BackupItem[] = [];

export async function queueBackupItem(item: BackupItem): Promise<void> {
  backupQueue.push({
    ...item,
    priority: item.priority || 'normal'
  });

  // Save queue to localStorage for persistence
  localStorage.setItem(BACKUP_QUEUE_KEY, JSON.stringify(backupQueue));

  // Process queue immediately
  await processBackupQueue();
}

export async function processBackupQueue(): Promise<void> {
  if (backupQueue.length === 0) return;

  // Sort by priority: high > normal > low
  const priorityOrder = { high: 3, normal: 2, low: 1 };
  backupQueue.sort((a, b) => {
    const aPriority = priorityOrder[a.priority || 'normal'];
    const bPriority = priorityOrder[b.priority || 'normal'];
    return bPriority - aPriority;
  });

  const item = backupQueue.shift();
  if (!item) return;

  try {
    await createManualBackup(
      item.payload,
      `${item.type}: ${item.id}`,
      `Auto-queued backup for ${item.type} ${item.id}`
    );

    // Update queue in localStorage
    localStorage.setItem(BACKUP_QUEUE_KEY, JSON.stringify(backupQueue));

    // Process next item if any
    if (backupQueue.length > 0) {
      setTimeout(processBackupQueue, 100); // Small delay to prevent blocking
    }
  } catch (error) {
    console.error('Failed to process backup queue item:', error);
    // Re-add item to end of queue for retry
    backupQueue.push(item);
    localStorage.setItem(BACKUP_QUEUE_KEY, JSON.stringify(backupQueue));
  }
}

// Load queue on module initialization
try {
  const savedQueue = localStorage.getItem(BACKUP_QUEUE_KEY);
  if (savedQueue) {
    backupQueue = JSON.parse(savedQueue);
  }
} catch (error) {
  console.error('Failed to load backup queue:', error);
  backupQueue = [];
}

// Auto-backup functionality
let autoBackupInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoBackup(
  getAppData: () => string,
  getTitle: () => string,
  intervalMs: number = 300000, // Default 5 minutes
): void {
  if (autoBackupInterval) {
    stopAutoBackup();
  }

  autoBackupInterval = setInterval(async () => {
    try {
      const backup: Backup = {
        id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'auto',
        title: getTitle(),
        description: 'Automatic backup',
        data: getAppData(),
        timestamp: Date.now(),
      };

      await saveBackup(backup);
      console.log('Auto-backup created successfully');
    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
  }, intervalMs);
}

export function stopAutoBackup(): void {
  if (autoBackupInterval) {
    clearInterval(autoBackupInterval);
    autoBackupInterval = null;
  }
}

export async function createManualBackup(
  data: unknown,
  title?: string,
  description?: string,
): Promise<{ success: boolean; backup?: Backup; error?: string }> {
  try {
    const backup: Backup = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'manual',
      title: title || 'Manual Backup',
      description: description || 'User-created backup',
      data,
      timestamp: Date.now(),
      size: new Blob([JSON.stringify(data)]).size,
    };

    await saveBackup(backup);
    return { success: true, backup };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Database initialization (for compatibility)
export async function ensureBackupDb(): Promise<void> {
  // This is a no-op since we're using localStorage
  // Kept for backward compatibility
  return Promise.resolve();
}

// Advanced BackupManager class for complex backup operations
export class BackupManager {
  private state: BackupManagerState = {
    status: 'idle',
    lastSuccess: null,
    error: null,
    retryCount: 0,
    retryDelayMs: 1000,
  };

  private isSaving = false;
  private maxRetries = 5;

  constructor(
    private backupFn: () => Promise<void>,
    private notify: NotifyFn,
  ) {}

  public getState(): BackupManagerState {
    return { ...this.state };
  }

  public async listBackups(): Promise<Backup[]> {
    return getBackups();
  }

  public async getStatus(): Promise<BackupStats> {
    return getBackupStatus();
  }

  public async restoreBackup(id: string) {
    return restoreBackup(id);
  }

  public async deleteBackup(id: string) {
    return deleteBackup(id);
  }

  public async exportBackup(id: string) {
    return exportBackup(id);
  }

  public async importBackup(file: File) {
    return importBackup(file);
  }

  public async clearAllBackups() {
    return clearAllBackups();
  }

  public async queueItem(item: BackupItem) {
    return queueBackupItem(item);
  }

  public async backup(): Promise<void> {
    if (this.isSaving) {
      this.notify('Backup already in progress. Please wait.', 'info');
      return;
    }

    this.isSaving = true;
    this.updateStatus('saving');
    this.notify('Starting backup...', 'info');

    try {
      await this.backupFn();
      this.updateStatus('success');
      this.state.lastSuccess = Date.now();
      this.state.error = null;
      this.state.retryCount = 0;
      this.state.retryDelayMs = 1000;
      this.notify('Backup successful!', 'success');
    } catch (error: any) {
      this.state.error = error?.message || 'Unknown error';
      this.updateStatus('error');
      this.notify(`Backup failed: ${this.state.error}`, 'error');
      await this.retryBackup();
    } finally {
      this.isSaving = false;
    }
  }

  private async retryBackup(): Promise<void> {
    if (this.state.retryCount >= this.maxRetries) {
      this.notify('Maximum backup retry attempts reached. Please try again later.', 'error');
      return;
    }

    this.state.retryCount++;
    this.updateStatus('retrying');
    this.notify(
      `Retrying backup (#${this.state.retryCount}) in ${this.state.retryDelayMs / 1000} seconds...`,
      'info',
    );

    await this.delay(this.state.retryDelayMs);
    this.state.retryDelayMs *= 2;
    await this.backup();
  }

  private updateStatus(status: BackupProcessStatus): void {
    this.state.status = status;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Create and export the service instance
const backupService = new BackupManager(
  () => Promise.resolve(),
  () => {},
);

// Export as default
export default backupService;