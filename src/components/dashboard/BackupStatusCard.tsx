import Card from "@/components/ui-kit/Card";
import { useBackup } from "@/hooks/useBackup";

export default function BackupStatusCard() {
  const { stats, loading, error } = useBackup();

  const label = loading
    ? "Checking…"
    : error
      ? "Unavailable"
      : stats.ok
        ? "Healthy"
        : "Initializing";

  const last =
    stats.lastRun != null ? new Date(stats.lastRun).toLocaleString() : "—";
  const queued = typeof stats.queued === "number" ? stats.queued : 0;

  return (
    <Card className="p-4">
      <div className="text-sm font-medium">Backup status</div>
      <div className="mt-1 text-xs text-gray-600">
        {label} – Last run {last} – Queue {queued}
      </div>
    </Card>
  );
}
