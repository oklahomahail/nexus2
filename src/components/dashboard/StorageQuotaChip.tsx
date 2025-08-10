import { useStorageQuota } from "@/hooks/useStorageQuota";

export default function StorageQuotaChip() {
  const storageQuota = useStorageQuota();

  // Handle the case where storageQuota might be null/undefined
  if (!storageQuota?.quota) return null;

  const usage = storageQuota.usage ?? 0;
  const quota = storageQuota.quota;

  const pct = Math.min(100, Math.max(0, Math.round((usage / quota) * 100)));

  return <span className="text-xs text-gray-600">Local storage {pct}%</span>;
}
