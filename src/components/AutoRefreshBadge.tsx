// src/components/AutoRefreshBadge.tsx
import clsx from "clsx";
import { RefreshCw } from "lucide-react";

interface AutoRefreshBadgeProps {
  isPolling: boolean;
  intervalMs: number;
  className?: string;
}

export default function AutoRefreshBadge({
  isPolling,
  intervalMs,
  className,
}: AutoRefreshBadgeProps) {
  const formatInterval = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  if (!isPolling) {
    return (
      <div
        className={clsx(
          "flex items-center gap-1 text-xs text-slate-400",
          className,
        )}
      >
        <RefreshCw className="w-3 h-3" />
        <span>Paused</span>
      </div>
    );
  }

  return (
    <div className={clsx("flex items-center gap-1 text-xs", className)}>
      <RefreshCw className="w-3 h-3 animate-spin" />
      <span>Auto-refreshing every {formatInterval(intervalMs)}</span>
    </div>
  );
}
