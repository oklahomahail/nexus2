// src/hooks/index.ts

// Individual hook exports - import and re-export to avoid conflicts
import useAutoSave from "./useAutoSave";
import useBackup from "./useBackup";
import useCampaigns from "./useCampaigns";
import useDebounce from "./useDebounce";
import useKeyboardShortcuts from "./useKeyboardShortcuts";
import useNotifications from "./useNotifications";
import useStorageQuota from "./useStorageQuota";

// Named export for usePolling (since it's exported as named, not default)
export { usePolling } from "./usePolling";

// Re-export all hooks with consistent naming
export {
  useAutoSave,
  useBackup,
  useCampaigns,
  useDebounce,
  useKeyboardShortcuts,
  useNotifications,
  useStorageQuota,
};
