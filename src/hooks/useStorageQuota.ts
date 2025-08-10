// src/hooks/useStorageQuota.ts
import { useState, useEffect } from "react";

interface StorageQuota {
  usage: number;
  quota: number;
  usagePercent: number;
  warningThreshold: number;
}

/**
 * Hook to estimate local storage usage (in browsers that support it).
 * Returns current usage, quota, and percentage used.
 */
export function useStorageQuota() {
  const [storageInfo, setStorageInfo] = useState<StorageQuota | undefined>(
    undefined,
  );

  useEffect(() => {
    const checkStorage = async () => {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const usage = estimate.usage || 0;
          const quota = estimate.quota || 0;
          const usagePercent = quota > 0 ? (usage / quota) * 100 : 0;

          setStorageInfo({
            usage,
            quota,
            usagePercent: Math.round(usagePercent * 100) / 100,
            warningThreshold: 80, // Warn at 80%
          });
        } catch (error) {
          console.warn("Storage quota check failed:", error);
          setStorageInfo(undefined);
        }
      } else {
        // Fallback: estimate localStorage usage manually
        try {
          let totalSize = 0;
          for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
              totalSize += localStorage[key].length + key.length;
            }
          }

          const estimatedQuota = 5 * 1024 * 1024; // 5MB estimate
          const usagePercent = (totalSize / estimatedQuota) * 100;

          setStorageInfo({
            usage: totalSize,
            quota: estimatedQuota,
            usagePercent: Math.round(usagePercent * 100) / 100,
            warningThreshold: 80,
          });
        } catch (error) {
          console.warn("Manual storage calculation failed:", error);
          setStorageInfo(undefined);
        }
      }
    };

    checkStorage();
    const interval = setInterval(checkStorage, 60000); // Re-check every minute

    return () => clearInterval(interval);
  }, []);

  return storageInfo;
}
