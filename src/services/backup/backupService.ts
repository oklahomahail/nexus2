// src/services/backup/backupService.ts

// Key used to store backups in localStorage
const BACKUPS_KEY = "nexus_backups";

// ---- Types ----

export interface Backup {
  id: string;
  data: unknown;
  timestamp: number;
}

export interface BackupEnvelope {
  schemaVersion: number; // bump this if you change structure
  appVersion?: string; // optional
  payload: Record<string, unknown>;
}

export interface BackupManagerState {
  totalBackups: number;
  lastBackup: number | null;
}

export interface BackupManager {
  getBackups: () => Promise<Backup[]>;
  saveBackup: (backup: Backup) => Promise<void>;
  restoreBackup: (id: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    restoredKeys?: string[];
    failedKeys?: string[];
  }>;
  deleteBackup: (
    id: string,
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

// ---- Utility ----

const isBrowser = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined";

// Keys you allow restoring + how to apply each one
type ApplyFn = (value: unknown) => void | Promise<void>;

/**
 * Map ONLY keys you explicitly allow to be restored.
 * Adjust these to match your app's persisted keys.
 */
const APPLY_MAP: Record<string, ApplyFn> = {
  "nexus:campaigns": (v) => {
    if (!isBrowser()) return;
    localStorage.setItem("nexus:campaigns", JSON.stringify(v));
  },
  "nexus:settings": (v) => {
    if (!isBrowser()) return;
    localStorage.setItem("nexus:settings", JSON.stringify(v));
  },
};

// No helper function needed - returning objects directly

// ---- Functions ----

export async function getBackups(): Promise<Backup[]> {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(BACKUPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Backup[];
  } catch {
    return [];
  }
}

export async function saveBackup(backup: Backup): Promise<void> {
  if (!isBrowser()) return;
  const backups = await getBackups();
  backups.push(backup);

  // Keep only the last 50 backups
  const recentBackups = backups
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);

  localStorage.setItem(BACKUPS_KEY, JSON.stringify(recentBackups));
}

export async function restoreBackup(id: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  restoredKeys: string[];
  failedKeys: string[];
}> {
  // helper: always include arrays
  const withArrays = (base: {
    success: boolean;
    message?: string;
    error?: string;
    restoredKeys?: string[];
    failedKeys?: string[];
  }) => ({
    success: base.success,
    message: base.message,
    error: base.error,
    restoredKeys: base.restoredKeys ?? [],
    failedKeys: base.failedKeys ?? [],
  });

  try {
    const backups = await getBackups();
    const found = backups.find((b) => b.id === id);
    if (!found) {
      return withArrays({
        success: false,
        error: "Backup not found",
      });
    }

    // Safe JSON parse for string payloads
    const safeParse = (s: string) => {
      try {
        return JSON.parse(s);
      } catch {
        return "__PARSE_ERR__" as const;
      }
    };

    const raw =
      typeof found.data === "string" ? safeParse(found.data) : found.data;

    if (raw === "__PARSE_ERR__") {
      return withArrays({
        success: false,
        error: "Incompatible backup format",
      });
    }

    // Accept envelope or legacy object
    let payload: Record<string, unknown>;
    if (
      raw &&
      typeof raw === "object" &&
      "schemaVersion" in (raw as any) &&
      "payload" in (raw as any)
    ) {
      const env = raw as BackupEnvelope;
      if (
        env.schemaVersion !== 1 ||
        !env.payload ||
        typeof env.payload !== "object"
      ) {
        return withArrays({
          success: false,
          error: "Incompatible backup format",
        });
      }
      payload = env.payload;
    } else if (raw && typeof raw === "object") {
      payload = raw as Record<string, unknown>;
    } else {
      return withArrays({
        success: false,
        error: "Incompatible backup format",
      });
    }

    // Validate keys against whitelist
    const keys = Object.keys(payload);
    const unknown = keys.filter((k) => !(k in APPLY_MAP));
    if (unknown.length) {
      return withArrays({
        success: false,
        error: `Unknown keys in backup: ${unknown.join(", ")}`,
      });
    }

    // Apply per key; collect only failures, compute successes from the complement
    const failedKeys: string[] = [];
    for (const k of keys) {
      try {
        await APPLY_MAP[k](payload[k]);
      } catch {
        failedKeys.push(k);
      }
    }

    const restoredKeys = keys.filter((k) => !failedKeys.includes(k));

    if (failedKeys.length) {
      return withArrays({
        success: false,
        error: `Failed to restore keys: ${failedKeys.join(", ")}`,
        restoredKeys,
        failedKeys,
      });
    }

    return withArrays({
      success: true,
      message: "Backup restored successfully",
      restoredKeys,
      failedKeys,
    });
  } catch (error) {
    return withArrays({
      success: false,
      error: `Failed to restore backup: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
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
      return { success: false, error: "Backup not found" };
    }

    localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));
    return { success: true, message: "Backup deleted successfully" };
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete backup: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/** Initializes backup storage (no-op stub; safe for SSR/tests). */
export async function ensureBackupDb(): Promise<void> {
  return;
}

/** Returns simple backup health for UI (count + last timestamp). */
export async function getBackupStatus(): Promise<{
  totalBackups: number;
  lastBackup: number | null;
}> {
  const backups = await getBackups();
  return {
    totalBackups: backups.length,
    lastBackup: backups.length > 0 ? backups[0].timestamp : null,
  };
}

/** Creates a manual backup from arbitrary data, wrapping in the envelope format used by restoreBackup. */
export async function createManualBackup(
  data: unknown,
  title?: string,
  description?: string,
) {
  const nowMs = () => Date.now();
  const makeId = () =>
    typeof crypto !== "undefined" &&
    typeof (crypto as any).randomUUID === "function"
      ? (crypto as any).randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const envelope: any = {
    schemaVersion: 1,
    payload:
      data && typeof data === "object" && (data as any).payload
        ? (data as any).payload
        : (data as Record<string, unknown>),
    appVersion:
      typeof import.meta !== "undefined"
        ? (import.meta as any)?.env?.VITE_APP_VERSION
        : undefined,
  };

  const backup: any = {
    id: makeId(),
    data: {
      ...envelope,
      meta: { title, description, createdAt: nowMs() },
    },
    timestamp: nowMs(),
  };

  await saveBackup(backup);
  return backup;
}
