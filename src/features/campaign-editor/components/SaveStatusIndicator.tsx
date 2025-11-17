import { SaveStatus } from "@/services/campaignPersistenceService";

interface Props {
  status: SaveStatus;
}

/**
 * Save Status Indicator
 *
 * Displays the current autosave status for the campaign editor.
 * Shows one of:
 * - "Saving..." when autosave is in progress
 * - "Saved [time]" when last save was successful
 * - Error message when save failed (changes are still in local storage)
 */
export function SaveStatusIndicator({ status }: Props) {
  if (status.saving) {
    return (
      <span className="text-gray-500 text-sm flex items-center gap-2">
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Saving...
      </span>
    );
  }

  if (status.error) {
    return (
      <span className="text-red-600 text-sm flex items-center gap-2">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {status.error}
      </span>
    );
  }

  if (status.lastSaved) {
    const timeAgo = formatRelativeTime(status.lastSaved);

    return (
      <span className="text-green-600 text-sm flex items-center gap-2">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        Saved {timeAgo}
      </span>
    );
  }

  return null;
}

/**
 * Format a date as a relative time string
 * Examples: "just now", "2 minutes ago", "1 hour ago"
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 10) {
    return "just now";
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? "1 minute ago"
      : `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
}
