// src/services/mockWebSocketServer.ts
// Simple mock WebSocket server for development
export class MockWebSocketServer {
  private clients: Set<WebSocket> = new Set();
  private campaigns: Map<string, any> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  start(port: number = 8080) {
    console.log("🚀 Mock WebSocket server would start on port", port);
    console.log(
      "📝 In development, you can simulate real-time events using the browser console:",
    );
    console.log(
      '   mockServer.simulateCampaignUpdate("campaign-id", "raised", 5000)',
    );
    console.log(
      '   mockServer.simulateMilestone("campaign-id", "goal_reached", 100)',
    );
  }

  // Simulate campaign updates for testing
  simulateCampaignUpdate(campaignId: string, field: string, value: number) {
    const update = {
      type: "campaign_update",
      payload: {
        campaignId,
        field,
        value,
        previousValue: value - Math.floor(Math.random() * 1000),
      },
      timestamp: Date.now(),
    };

    this.broadcast(update);
    console.log("📡 Simulated campaign update:", update);
  }

  simulateMilestone(campaignId: string, milestoneType: string, value: number) {
    const alert = {
      type: "milestone_alert",
      payload: {
        campaignId,
        milestoneType,
        value,
        message: `Campaign reached ${value}% of goal!`,
      },
      timestamp: Date.now(),
    };

    this.broadcast(alert);
    console.log("🎉 Simulated milestone alert:", alert);
  }

  simulateNotification(title: string, message: string, campaignId?: string) {
    const notification = {
      type: "notification",
      payload: {
        id: Math.random().toString(36).substr(2, 9),
        type: "info",
        title,
        message,
        campaignId,
        timestamp: Date.now(),
        read: false,
      },
      timestamp: Date.now(),
    };

    this.broadcast(notification);
    console.log("🔔 Simulated notification:", notification);
  }

  // Start continuous updates for a campaign (for testing)
  startCampaignSimulation(campaignId: string, intervalMs: number = 5000) {
    if (this.intervals.has(campaignId)) {
      this.stopCampaignSimulation(campaignId);
    }

    const interval = setInterval(() => {
      // Simulate random donation
      const amount = Math.floor(Math.random() * 500) + 25;
      this.simulateCampaignUpdate(campaignId, "raised", amount);

      // Occasionally simulate milestones
      if (Math.random() < 0.1) {
        const percentage = Math.floor(Math.random() * 100);
        this.simulateMilestone(campaignId, "percentage_milestone", percentage);
      }
    }, intervalMs);

    this.intervals.set(campaignId, interval);
    console.log(`🔄 Started simulation for campaign ${campaignId}`);
  }

  stopCampaignSimulation(campaignId: string) {
    const interval = this.intervals.get(campaignId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(campaignId);
      console.log(`⏹️ Stopped simulation for campaign ${campaignId}`);
    }
  }

  private broadcast(message: any) {
    // In a real implementation, this would send to WebSocket clients
    // For now, we'll use the existing WebSocket service to handle mock data
    if (typeof window !== "undefined" && (window as any).mockWebSocketMessage) {
      (window as any).mockWebSocketMessage(message);
    }
  }
}

// Export global instance for console access
export const mockServer = new MockWebSocketServer();

// Make it globally available for testing
if (typeof window !== "undefined") {
  (window as any).mockServer = mockServer;
}

// Development helper to inject mock messages
if (import.meta.env.DEV) {
  // Override WebSocket in development to handle mock messages
  const originalWebSocket = window.WebSocket;

  class MockWebSocket extends originalWebSocket {
    constructor(url: string) {
      super(url);

      // Set up mock message handler
      (window as any).mockWebSocketMessage = (message: any) => {
        if (this.readyState === WebSocket.OPEN) {
          // Simulate receiving message
          setTimeout(() => {
            this.dispatchEvent(
              new MessageEvent("message", {
                data: JSON.stringify(message),
              }),
            );
          }, 100);
        }
      };

      // Simulate successful connection in development
      setTimeout(() => {
        if (this.readyState === WebSocket.CONNECTING) {
          this.dispatchEvent(new Event("open"));
        }
      }, 1000);
    }
  }

  // Only replace in development
  if (import.meta.env.VITE_ENABLE_REAL_TIME === "true") {
    window.WebSocket = MockWebSocket as any;
  }
}
