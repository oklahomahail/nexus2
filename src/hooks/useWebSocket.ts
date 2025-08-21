// src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback, useState } from "react";

import { useClient } from "../context/ClientContext";
import websocketService, {
  ConnectionStatus,
  CampaignUpdate,
  MilestoneAlert,
  NotificationMessage,
} from "../services/websocketService";

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  subscribeToCampaigns?: string[];
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribeToCampaign: (campaignId: string) => void;
  unsubscribeFromCampaign: (campaignId: string) => void;
  sendMessage: (type: string, payload: any) => void;
}

export function useWebSocket(
  options: UseWebSocketOptions = {},
): UseWebSocketReturn {
  const { autoConnect = true, subscribeToCampaigns = [] } = options;
  const { currentClient } = useClient();
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const subscribedCampaigns = useRef<Set<string>>(new Set());
  const isInitialized = useRef(false);

  // Connection management
  const connect = useCallback(async () => {
    if (!currentClient?.id) {
      console.warn("Cannot connect WebSocket: no client selected");
      return;
    }

    try {
      await websocketService.connect(currentClient.id);

      // Subscribe to campaigns after connection
      subscribeToCampaigns.forEach((campaignId) => {
        websocketService.subscribeToCampaign(campaignId);
        subscribedCampaigns.current.add(campaignId);
      });
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }, [currentClient?.id, subscribeToCampaigns]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    subscribedCampaigns.current.clear();
  }, []);

  // Campaign subscription management
  const subscribeToCampaign = useCallback((campaignId: string) => {
    if (websocketService.isConnected()) {
      websocketService.subscribeToCampaign(campaignId);
      subscribedCampaigns.current.add(campaignId);
    }
  }, []);

  const unsubscribeFromCampaign = useCallback((campaignId: string) => {
    if (websocketService.isConnected()) {
      websocketService.unsubscribeFromCampaign(campaignId);
      subscribedCampaigns.current.delete(campaignId);
    }
  }, []);

  // Message sending
  const sendMessage = useCallback((type: string, payload: any) => {
    websocketService.send({ type, payload });
  }, []);

  // Set up connection status listener
  useEffect(() => {
    const unsubscribe =
      websocketService.onConnectionChange(setConnectionStatus);

    // Set initial status
    setConnectionStatus(websocketService.getConnectionStatus());

    return unsubscribe;
  }, []);

  // Auto-connect when client changes
  useEffect(() => {
    if (autoConnect && currentClient?.id && !isInitialized.current) {
      isInitialized.current = true;
      void connect();
    }

    return () => {
      if (isInitialized.current) {
        disconnect();
        isInitialized.current = false;
      }
    };
  }, [currentClient?.id, autoConnect, connect, disconnect]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected: connectionStatus === "connected",
    connectionStatus,
    connect,
    disconnect,
    subscribeToCampaign,
    unsubscribeFromCampaign,
    sendMessage,
  };
}

// Specialized hooks for specific event types
export function useCampaignUpdates(campaignId?: string) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const { subscribeToCampaign, unsubscribeFromCampaign } = useWebSocket();

  useEffect(() => {
    const unsubscribe = websocketService.on<CampaignUpdate>(
      "campaign_update",
      (update) => {
        if (!campaignId || update.campaignId === campaignId) {
          setUpdates((prev) => [update, ...prev].slice(0, 100)); // Keep last 100 updates
        }
      },
    );

    // Subscribe to specific campaign if provided
    if (campaignId) {
      subscribeToCampaign(campaignId);
    }

    return () => {
      unsubscribe();
      if (campaignId) {
        unsubscribeFromCampaign(campaignId);
      }
    };
  }, [campaignId, subscribeToCampaign, unsubscribeFromCampaign]);

  return { updates, clearUpdates: () => setUpdates([]) };
}

export function useMilestoneAlerts() {
  const [alerts, setAlerts] = useState<MilestoneAlert[]>([]);

  useEffect(() => {
    const unsubscribe = websocketService.on<MilestoneAlert>(
      "milestone_alert",
      (alert) => {
        setAlerts((prev) => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
      },
    );

    return unsubscribe;
  }, []);

  const dismissAlert = useCallback((campaignId: string) => {
    setAlerts((prev) =>
      prev.filter((alert) => alert.campaignId !== campaignId),
    );
  }, []);

  return { alerts, dismissAlert, clearAlerts: () => setAlerts([]) };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  useEffect(() => {
    const unsubscribe = websocketService.on<NotificationMessage>(
      "notification",
      (notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 100));
      },
    );

    return unsubscribe;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    dismissNotification,
    clearNotifications: () => setNotifications([]),
  };
}

// Connection status indicator hook
export function useConnectionStatus() {
  const { connectionStatus, connect } = useWebSocket({ autoConnect: false });

  const retry = useCallback(() => {
    if (connectionStatus === "disconnected" || connectionStatus === "error") {
      void connect();
    }
  }, [connectionStatus, connect]);

  return {
    status: connectionStatus,
    isConnected: connectionStatus === "connected",
    isConnecting: connectionStatus === "connecting",
    hasError: connectionStatus === "error",
    retry,
  };
}
