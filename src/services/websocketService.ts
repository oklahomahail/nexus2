// src/services/websocketService.ts
type Timer = ReturnType<typeof setTimeout>;

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

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface WebSocketConfig {
  /** Can be absolute ws/wss/http/https URL or a relative path like "/ws" */
  url: string;
  reconnectAttempts: number;
  reconnectInterval: number; // base ms
  heartbeatInterval: number;
  timeout: number;
  /** Optional auth token appended as ?token=... */
  token?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private listeners = new Map<RealtimeEventType, Set<(data: any) => void>>();
  private connectionListeners = new Set<(status: ConnectionStatus) => void>();
  private reconnectAttempts = 0;
  private reconnectTimer: Timer | null = null;
  private heartbeatTimer: Timer | null = null;
  private clientId: string | null = null;
  private isIntentionallyClosed = false;

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = {
      url: import.meta.env.VITE_WEBSOCKET_URL || this.inferDefaultUrl(),
      reconnectAttempts: 6,
      reconnectInterval: 1500,
      heartbeatInterval: 30000,
      timeout: 10000,
      token: import.meta.env.VITE_WEBSOCKET_TOKEN,
      ...config,
    };
  }

  /* ---------- Connection ---------- */

  async connect(clientId: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.clientId = clientId;
    this.isIntentionallyClosed = false;
    this.notifyConnectionStatus("connecting");

    const url = this.buildUrl(this.config.url, {
      clientId,
      token: this.config.token,
    });

    await new Promise<void>((resolve, reject) => {
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        this.notifyConnectionStatus("error");
        reject(new Error("WebSocket connection timeout"));
      }, this.config.timeout);

      try {
        this.ws = new WebSocket(url);
      } catch (e) {
        clearTimeout(timer);
        this.notifyConnectionStatus("error");
        reject(e);
        return;
      }

      this.ws.onopen = () => {
        if (timedOut) return;
        clearTimeout(timer);
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.notifyConnectionStatus("connected");
        resolve();
      };

      this.ws.onmessage = (event) => this.handleMessage(event);

      this.ws.onclose = () => {
        clearTimeout(timer);
        this.stopHeartbeat();
        if (!this.isIntentionallyClosed) {
          this.notifyConnectionStatus("disconnected");
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        clearTimeout(timer);
        this.notifyConnectionStatus("error");
        // Let the close handler schedule reconnects if the socket closes
        if (this.ws?.readyState !== WebSocket.OPEN) {
          reject(new Error("WebSocket connection failed"));
        }
      };
    });
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.stopReconnectTimer();
    this.stopHeartbeat();
    if (this.ws) {
      try {
        this.ws.close(1000, "intentional");
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.notifyConnectionStatus("disconnected");
  }

  /* ---------- Messaging ---------- */

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      // Heartbeat handling
      if (message.type === "ping") {
        this.send({ type: "pong", payload: null });
        return;
      }

      // Scope messages to current client if tagged
      if (message.clientId && message.clientId !== this.clientId) return;

      const type = message.type as RealtimeEventType;
      const callbacks = this.listeners.get(type);
      if (callbacks) {
        callbacks.forEach((cb) => {
          try {
            cb(message.payload);
          } catch (err) {
            console.error("Error in WebSocket listener:", err);
          }
        });
      }
    } catch (err) {
      console.error("Error parsing WebSocket message:", err);
    }
  }

  send(message: Omit<WebSocketMessage, "timestamp">): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const full: WebSocketMessage = {
        ...message,
        timestamp: Date.now(),
        clientId: message.clientId || this.clientId || undefined,
      };
      this.ws.send(JSON.stringify(full));
    } else {
      console.warn("WebSocket not connected, message not sent:", message);
    }
  }

  subscribeToCampaign(campaignId: string): void {
    this.send({ type: "subscribe_campaign", payload: { campaignId } });
  }

  unsubscribeFromCampaign(campaignId: string): void {
    this.send({ type: "unsubscribe_campaign", payload: { campaignId } });
  }

  /* ---------- Events ---------- */

  on<T = any>(
    eventType: RealtimeEventType,
    callback: (data: T) => void,
  ): () => void {
    if (!this.listeners.has(eventType))
      this.listeners.set(eventType, new Set());
    this.listeners.get(eventType)!.add(callback);
    return () => {
      const set = this.listeners.get(eventType);
      if (!set) return;
      set.delete(callback);
      if (!set.size) this.listeners.delete(eventType);
    };
  }

  onConnectionChange(callback: (status: ConnectionStatus) => void): () => void {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  /* ---------- Heartbeat ---------- */

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: "ping", payload: null });
    }, this.config.heartbeatInterval) as unknown as Timer;
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /* ---------- Reconnect ---------- */

  private scheduleReconnect(): void {
    if (this.isIntentionallyClosed || !this.clientId) return;

    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      console.error("Max reconnection attempts reached");
      this.notifyConnectionStatus("error");
      return;
    }

    this.reconnectAttempts += 1;
    const base = this.config.reconnectInterval;
    const backoff = Math.min(30000, base * 2 ** (this.reconnectAttempts - 1));
    const jitter = backoff * (0.5 + Math.random() * 0.5);

    this.stopReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.clientId!).catch(() => {
        // let onclose schedule the next attempt
      });
    }, jitter);
  }

  private stopReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /* ---------- Utils ---------- */

  private notifyConnectionStatus(status: ConnectionStatus): void {
    this.connectionListeners.forEach((cb) => {
      try {
        cb(status);
      } catch (e) {
        console.error("Error in connection status listener:", e);
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

  private buildUrl(
    raw: string,
    params: Record<string, string | undefined>,
  ): string {
    // Accept ws/wss/http/https absolute, or relative like "/ws"
    let u: URL;
    if (/^https?:\/\//i.test(raw) || /^wss?:\/\//i.test(raw)) {
      u = new URL(raw);
    } else {
      // Treat as relative to current origin
      const base =
        typeof window !== "undefined"
          ? window.location.href
          : "http://localhost/";
      u = new URL(raw.startsWith("/") ? raw : `/${raw}`, base);
    }
    // Normalize protocol to ws/wss
    if (u.protocol === "https:") u.protocol = "wss:";
    if (u.protocol === "http:") u.protocol = "ws:";

    Object.entries(params).forEach(([k, v]) => {
      if (v) u.searchParams.set(k, v);
    });

    return u.toString();
  }

  private inferDefaultUrl(): string {
    if (typeof window !== "undefined") {
      const { protocol, host } = window.location;
      const wsProto = protocol === "https:" ? "wss:" : "ws:";
      // Default to a relative path that can be proxied in dev
      return `${wsProto}//${host}/ws`;
    }
    // Fallback for SSR/tools
    return "ws://localhost:8787/ws";
  }

  destroy(): void {
    this.disconnect();
    this.listeners.clear();
    this.connectionListeners.clear();
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
