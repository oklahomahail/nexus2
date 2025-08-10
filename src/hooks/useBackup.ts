import { useEffect, useState } from "react";

import {
  getBackupStatus,
  ensureBackupDb,
} from "@/services/backup/backupService";

export interface BackupStats {
  ok: boolean;
  lastRun?: number; // epoch ms
  queued?: number;
}

export function useBackup() {
  const [stats, setStats] = useState<BackupStats>({ ok: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await ensureBackupDb();
        const s = await getBackupStatus();
        if (mounted) {
          setStats({
            ok: Boolean(s?.totalBackups > 0), // Map totalBackups to ok
            lastRun: s?.lastBackup ?? undefined, // Convert null to undefined
            queued: 0, // Default to 0 since we don't track queue size yet
          });
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setError("Failed to read backup status");
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { stats, loading, error };
}
