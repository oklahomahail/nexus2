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
  sendMessage: <T = unknown>(type: string, payload: T) => void;
}

export function useWebSocket(
  options: UseWebSocketOptions = {},
): UseWebSocketReturn {
  const { autoConnect = true, subscribeToCampaigns = [] } = options;
  const { currentClient } = useClient();

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  // Tracks desired subscriptions regardless of current socket state
  const subscribedCampaigns = useRef<Set<string>>(
    new Set(subscribeToCampaigns),
  );

  // Queue for outbound messages while disconnected
  const pendingMessages = useRef<Array<{ type: string; payload: unknown }>>([]);

  // Prevent duplicate connect attempts
  const connecting = useRef(false);
  const initializedForClient = useRef<string | null>(null);

  const connect = useCallback(async () => {
    const clientId = currentClient?.id;
    if (!clientId) return; // silent no-op until a client is selected

    if (connecting.current) return;
    if (websocketService.getConnectionStatus() === "connected") return;

    try {
      connecting.current = true;
      await websocketService.connect(clientId);
    } catch (err) {
      // Keep the error visible but concise
      console.error("WebSocket connect failed:", err);
    } finally {
      connecting.current = false;
    }
  }, [currentClient?.id]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const subscribeToCampaign = useCallback((campaignId: string) => {
    // Always record intent to subscribe
    subscribedCampaigns.current.add(campaignId);

    // If connected, send immediately; otherwise, it will be sent on next connect
    if (websocketService.isConnected()) {
      websocketService.subscribeToCampaign(campaignId);
    }
  }, []);

  const unsubscribeFromCampaign = useCallback((campaignId: string) => {
    subscribedCampaigns.current.delete(campaignId);
    if (websocketService.isConnected()) {
      websocketService.unsubscribeFromCampaign(campaignId);
    }
  }, []);

  const sendMessage = useCallback(<T>(type: string, payload: T) => {
    if (websocketService.isConnected()) {
      websocketService.send({ type, payload });
      return;
    }
    // Queue and flush on next connect
    pendingMessages.current.push({ type, payload });
  }, []);

  // Connection status listener
  useEffect(() => {
    const unsubscribe = websocketService.onConnectionChange((status) => {
      setConnectionStatus(status);

      // On each successful connection, rehydrate subscriptions and flush messages
      if (status === "connected") {
        // Resubscribe to everything we intend to follow
        for (const id of subscribedCampaigns.current) {
          websocketService.subscribeToCampaign(id);
        }
        // Flush any queued messages
        if (pendingMessages.current.length) {
          for (const msg of pendingMessages.current) {
            websocketService.send(msg);
          }
          pendingMessages.current = [];
        }
      }
    });

    // Set initial status
    setConnectionStatus(websocketService.getConnectionStatus());
    return unsubscribe;
  }, []);

  // Auto-connect lifecycle per selected client
  useEffect(() => {
    const clientId = currentClient?.id;

    if (!autoConnect) return;
    if (!clientId) return;

    // Only initialize once per client id
    if (initializedForClient.current !== clientId) {
      initializedForClient.current = clientId;
      // Seed desired subs from options on first init for this client
      for (const id of subscribeToCampaigns) {
        subscribedCampaigns.current.add(id);
      }
      void connect();
    }

    // Cleanup when client changes away or component unmounts
    return () => {
      if (
        initializedForClient.current &&
        initializedForClient.current !== clientId
      ) {
        disconnect();
        initializedForClient.current = null;
      }
    };
  }, [
    autoConnect,
    currentClient?.id,
    subscribeToCampaigns,
    connect,
    disconnect,
  ]);

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

/* ---------- Event-specific helpers ---------- */

export function useCampaignUpdates(campaignId?: string) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const { subscribeToCampaign, unsubscribeFromCampaign } = useWebSocket();

  useEffect(() => {
    const off = websocketService.on<CampaignUpdate>(
      "campaign_update",
      (update) => {
        if (!campaignId || update.campaignId === campaignId) {
          setUpdates((prev) => [update, ...prev].slice(0, 100));
        }
      },
    );

    if (campaignId) subscribeToCampaign(campaignId);

    return () => {
      off();
      if (campaignId) unsubscribeFromCampaign(campaignId);
    };
  }, [campaignId, subscribeToCampaign, unsubscribeFromCampaign]);

  return { updates, clearUpdates: () => setUpdates([]) };
}

export function useMilestoneAlerts() {
  const [alerts, setAlerts] = useState<MilestoneAlert[]>([]);

  useEffect(() => {
    return websocketService.on<MilestoneAlert>("milestone_alert", (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 50));
    });
  }, []);

  const dismissAlert = useCallback((campaignId: string) => {
    setAlerts((prev) => prev.filter((a) => a.campaignId !== campaignId));
  }, []);

  return { alerts, dismissAlert, clearAlerts: () => setAlerts([]) };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  useEffect(() => {
    return websocketService.on<NotificationMessage>("notification", (n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 100));
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAsRead,
    dismissNotification,
    clearNotifications: () => setNotifications([]),
  };
}

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
