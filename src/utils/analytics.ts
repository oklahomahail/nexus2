// Ultra-light analytics tracking
type NavigationEvent = { type: "nav"; to: string; from?: string };
type TutorialEvent = {
  type: "tutorial_step";
  id: string;
  action: "next" | "back" | "skip" | "dismiss";
};
type ClientEvent = { type: "client_switch"; clientId: string };
type CampaignEvent = {
  type: "campaign_switch";
  campaignId: string;
  clientId: string;
};

type AnalyticsEvent =
  | NavigationEvent
  | TutorialEvent
  | ClientEvent
  | CampaignEvent;

export function track(event: AnalyticsEvent) {
  // In development, log to console
  if (import.meta.env.DEV) {
    console.debug("[analytics]", event);
  }

  // In production, you would send to your analytics provider
  // Example implementations:

  // Google Analytics 4
  // gtag('event', event.type, { ...event });

  // Custom API endpoint
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(event)
  // }).catch(() => {}); // Fail silently

  // Local storage for development debugging
  try {
    const events = JSON.parse(localStorage.getItem("nexus:analytics") || "[]");
    events.push({ ...event, timestamp: Date.now() });
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    localStorage.setItem("nexus:analytics", JSON.stringify(events));
  } catch {
    // Ignore storage errors
  }
}

// Helper functions for common events
export const analytics = {
  navigation: (to: string, from?: string) => track({ type: "nav", to, from }),
  tutorialStep: (id: string, action: TutorialEvent["action"]) =>
    track({ type: "tutorial_step", id, action }),
  clientSwitch: (clientId: string) =>
    track({ type: "client_switch", clientId }),
  campaignSwitch: (campaignId: string, clientId: string) =>
    track({ type: "campaign_switch", campaignId, clientId }),

  // Development helper to view tracked events
  getEvents: () => {
    try {
      return JSON.parse(localStorage.getItem("nexus:analytics") || "[]");
    } catch {
      return [];
    }
  },

  clearEvents: () => {
    localStorage.removeItem("nexus:analytics");
  },
};
