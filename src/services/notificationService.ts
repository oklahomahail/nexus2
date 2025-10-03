// src/services/notificationsService.ts
import { apiClient } from "./apiClient";

export type NotificationDTO = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string; // ISO
  read: boolean;
  clientId?: string; // For client-scoped notifications
};

export async function fetchNotifications(
  since?: string,
  clientId?: string,
): Promise<NotificationDTO[]> {
  const params = new URLSearchParams();
  if (since) params.set("since", since);
  if (clientId) params.set("clientId", clientId);

  const endpoint = `/notifications${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const data = await apiClient.get<NotificationDTO[]>(endpoint);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    // Return mock data in development when API is not available
    if (import.meta.env.DEV) {
      return getMockNotifications(since);
    }
    throw error;
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiClient.post(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsAsRead(
  clientId?: string,
): Promise<void> {
  const body = clientId ? { clientId } : {};
  await apiClient.post("/notifications/read-all", body);
}

// Mock data for development
function getMockNotifications(since?: string): NotificationDTO[] {
  const mockData: NotificationDTO[] = [
    {
      id: "1",
      title: "New Donation Received",
      message: "John Smith donated $500 to the Annual Fund campaign",
      type: "success",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      read: false,
      clientId: "acme",
    },
    {
      id: "2",
      title: "Campaign Goal Achieved",
      message: "Spring Fundraiser has reached 100% of its goal",
      type: "success",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      read: false,
      clientId: "acme",
    },
    {
      id: "3",
      title: "Monthly Report Available",
      message: "Your monthly analytics report is ready for download",
      type: "info",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: true,
      clientId: "acme",
    },
    {
      id: "4",
      title: "Payment Processing Issue",
      message: "There was an issue processing a $250 donation. Please review.",
      type: "error",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
      clientId: "green-future",
    },
  ];

  if (since) {
    const sinceDate = new Date(since);
    return mockData.filter((n) => new Date(n.timestamp) > sinceDate);
  }

  return mockData;
}
