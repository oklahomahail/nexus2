// src/services/backupCore.ts

/** Possible backup statuses */
export type BackupStatus = 'idle' | 'saving' | 'success' | 'error' | 'retrying';

/** State shape for BackupManager */
export interface BackupManagerState {
  status: BackupStatus;
  lastSuccess: number | null;
  error: string | null;
  retryCount: number;
  retryDelayMs: number;
}

/** Your backup data shape - customize as needed */
export interface Backup {
  [x: string]: any;
  id: string;
  data: unknown; // Replace 'unknown' with your actual data type
  timestamp: number; // Unix timestamp ms when backup was created
}

/** Notify function type for sending user messages */
type NotifyFn = (message: string, type?: 'info' | 'success' | 'error') => void;

/** BackupManager class with retry and exponential backoff logic */
export class BackupManager {
  private state: BackupManagerState = {
    status: 'idle',
    lastSuccess: null,
    error: null,
    retryCount: 0,
    retryDelayMs: 1000, // 1 second initial retry delay
  };

  private isSaving = false;
  private maxRetries = 5;

  constructor(
    private backupFn: () => Promise<void>,
    private notify: NotifyFn,
  ) {}

  /** Get current backup state snapshot */
  public getState() {
    return { ...this.state };
  }

  /** Trigger a backup */
  public async backup() {
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

  /** Retry backup with exponential backoff */
  private async retryBackup() {
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
    this.state.retryDelayMs *= 2; // double the retry delay for exponential backoff
    await this.backup();
  }

  /** Update current backup status */
  private updateStatus(status: BackupStatus) {
    this.state.status = status;
  }

  /** Utility: delay helper */
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
