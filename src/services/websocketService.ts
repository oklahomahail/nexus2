// src/services/websocketService.ts
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  clientId?: string;
}

export interface CampaignUpdate {
  campaignId: string;
  field: "raised" | "donors" | "goal" | "status";
  value: number | string;
  previousValue?: number | string;
}

export interface MilestoneAlert {
  campaignId: string;
  milestoneType:
    | "goal_reached"
    | "percentage_milestone"
    | "donor_milestone"
    | "time_milestone";
  value: number;
  message: string;
}

export interface NotificationMessage {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  campaignId?: string;
  timestamp: number;
  read: boolean;
}

export type RealtimeEventType =
  | "campaign_update"
  | "milestone_alert"
  | "notification"
  | "user_activity"
  | "system_status";

export interface RealtimeEvent {
  type: RealtimeEventType;
  data: CampaignUpdate | MilestoneAlert | NotificationMessage | any;
  timestamp: number;
  clientId: string;
}

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
  timeout: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private listeners: Map<RealtimeEventType, Set<(data: any) => void>> =
    new Map();
  private connectionListeners: Set<(status: ConnectionStatus) => void> =
    new Set();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private clientId: string | null = null;
  private isIntentionallyClosed = false;

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = {
      url: import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8080",
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      heartbeatInterval: 30000,
      timeout: 10000,
      ...config,
    };
  }

  // Connection Management
  connect(clientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.clientId = clientId;
      this.isIntentionallyClosed = false;
      this.notifyConnectionStatus("connecting");

      try {
        this.ws = new WebSocket(`${this.config.url}?clientId=${clientId}`);

        const timeout = setTimeout(() => {
          reject(new Error("WebSocket connection timeout"));
        }, this.config.timeout);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.notifyConnectionStatus("connected");
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (_event) => {
          clearTimeout(timeout);
          this.stopHeartbeat();

          if (!this.isIntentionallyClosed) {
            this.notifyConnectionStatus("disconnected");
            this.attemptReconnect();
          }
        };

        this.ws.onerror = () => {
          clearTimeout(timeout);
          this.notifyConnectionStatus("error");
          reject(new Error("WebSocket connection failed"));
        };
      } catch (error) {
        this.notifyConnectionStatus("error");
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.stopReconnectTimer();
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.notifyConnectionStatus("disconnected");
  }

  // Message Handling
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      // Handle heartbeat
      if (message.type === "ping") {
        this.send({ type: "pong", payload: null });
        return;
      }

      // Validate client scope
      if (message.clientId && message.clientId !== this.clientId) {
        return; // Ignore messages for other clients
      }

      // Route to appropriate listeners
      const listeners = this.listeners.get(message.type as RealtimeEventType);
      if (listeners) {
        listeners.forEach((callback) => {
          try {
            callback(message.payload);
          } catch (error) {
            console.error("Error in WebSocket listener:", error);
          }
        });
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  // Event Subscription
  on<T = any>(
    eventType: RealtimeEventType,
    callback: (data: T) => void,
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  onConnectionChange(callback: (status: ConnectionStatus) => void): () => void {
    this.connectionListeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  // Message Sending
  send(message: Omit<WebSocketMessage, "timestamp">): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        type: message.type,
        payload: message.payload,
        timestamp: Date.now(),
        clientId: message.clientId || this.clientId || undefined,
      };

      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn("WebSocket not connected, message not sent:", message);
    }
  }

  // Campaign-specific methods
  subscribeToCampaign(campaignId: string): void {
    this.send({
      type: "subscribe_campaign",
      payload: { campaignId },
    });
  }

  unsubscribeFromCampaign(campaignId: string): void {
    this.send({
      type: "unsubscribe_campaign",
      payload: { campaignId },
    });
  }

  // Heartbeat Management
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: "ping", payload: null });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Reconnection Logic
  private attemptReconnect(): void {
    if (this.isIntentionallyClosed || !this.clientId) return;

    if (this.reconnectAttempts < this.config.reconnectAttempts) {
      this.reconnectAttempts++;

      this.reconnectTimer = setTimeout(() => {
        console.log(
          `Attempting to reconnect... (${this.reconnectAttempts}/${this.config.reconnectAttempts})`,
        );
        this.connect(this.clientId!).catch(() => {
          // Reconnection failed, will try again
        });
      }, this.config.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
      this.notifyConnectionStatus("error");
    }
  }

  private stopReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // Utility Methods
  private notifyConnectionStatus(status: ConnectionStatus): void {
    this.connectionListeners.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error("Error in connection status listener:", error);
      }
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionStatus(): ConnectionStatus {
    if (!this.ws) return "disconnected";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "error";
    }
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.listeners.clear();
    this.connectionListeners.clear();
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
