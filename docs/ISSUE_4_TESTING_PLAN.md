# Issue #4: Integration Testing Plan

## 📋 Status: DOCUMENTED

**Created:** 2025-01-14
**Test Framework:** Vitest + React Testing Library + MSW

---

## Overview

This document outlines a comprehensive integration testing strategy for Track15 features implemented in Phase 6. The tests ensure Track15 campaign creation, analytics display, and navigation work correctly end-to-end.

---

## Testing Stack

### Current Setup

✅ **Vitest** - Fast unit test framework (Vite-native)
✅ **React Testing Library** - Component testing with user-centric queries
✅ **MSW (Mock Service Worker)** - API mocking
✅ **jsdom** - DOM environment for component rendering
✅ **@testing-library/jest-dom** - Custom matchers

### Configuration Files

- [vite.config.ts:88-94](../vite.config.ts#L88-L94) - Test configuration
- [src/test/setup.ts](../src/test/setup.ts) - Global test setup
- [src/test/msw/handlers.ts](../src/test/msw/handlers.ts) - API mock handlers
- [src/test/msw/server.ts](../src/test/msw/server.ts) - MSW server setup

---

## Test Categories

### 1. Unit Tests (Hooks)

Test individual React hooks in isolation.

#### useTrack15Metrics.test.ts

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTrack15Metrics } from "@/hooks/useTrack15Metrics";
import * as track15Service from "@/services/track15Service";

describe("useTrack15Metrics", () => {
  it("should fetch metrics for valid campaign ID", async () => {
    const mockMetrics = {
      control_conversion: 0.032,
      track15_conversion: 0.048,
      lift_percentage: 50.0,
      control_revenue: 45230,
      track15_revenue: 67845,
      revenue_lift: 50.0,
    };

    vi.spyOn(track15Service, "getLiftMetrics").mockResolvedValue(mockMetrics);

    const { result } = renderHook(() => useTrack15Metrics("campaign-123"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.metrics).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics).toEqual(mockMetrics);
    expect(result.current.error).toBeNull();
  });

  it("should handle errors gracefully", async () => {
    vi.spyOn(track15Service, "getLiftMetrics").mockRejectedValue(
      new Error("Database connection failed"),
    );

    const { result } = renderHook(() => useTrack15Metrics("campaign-123"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBe("Database connection failed");
  });

  it("should not fetch when campaign ID is null", () => {
    const spy = vi.spyOn(track15Service, "getLiftMetrics");
    const { result } = renderHook(() => useTrack15Metrics(null));

    expect(result.current.metrics).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("should refetch when campaign ID changes", async () => {
    const spy = vi
      .spyOn(track15Service, "getLiftMetrics")
      .mockResolvedValue({} as any);

    const { rerender } = renderHook(({ id }) => useTrack15Metrics(id), {
      initialProps: { id: "campaign-1" },
    });

    await waitFor(() => expect(spy).toHaveBeenCalledWith("campaign-1"));

    rerender({ id: "campaign-2" });

    await waitFor(() => expect(spy).toHaveBeenCalledWith("campaign-2"));
  });
});
```

#### useTrack15Segments.test.ts

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTrack15Segments } from "@/hooks/useTrack15Segments";
import * as track15Service from "@/services/track15Service";

describe("useTrack15Segments", () => {
  it("should fetch segment performance data", async () => {
    const mockSegments = [
      {
        segment_name: "Champions",
        donor_count: 45,
        total_gifts: 12500,
        avg_gift_size: 277.78,
        lift_percentage: 52.3,
      },
    ];

    vi.spyOn(track15Service, "getSegmentPerformance").mockResolvedValue(
      mockSegments,
    );

    const { result } = renderHook(() => useTrack15Segments("campaign-123"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.segments).toEqual(mockSegments);
    expect(result.current.error).toBeNull();
  });

  // Add similar tests for error handling, null campaignId, refetch
});
```

---

### 2. Service Tests

Test Track15 service methods with mocked Supabase client.

#### track15Service.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getLiftMetrics,
  getSegmentPerformance,
} from "@/services/track15Service";
import { supabase } from "@/lib/supabaseClient";

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("track15Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLiftMetrics", () => {
    it("should calculate lift metrics correctly", async () => {
      const mockCampaignData = {
        data: {
          track15_control_conversion: 0.032,
          track15_test_conversion: 0.048,
          track15_control_revenue: 45230,
          track15_test_revenue: 67845,
        },
        error: null,
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockCampaignData),
          }),
        }),
      });

      const result = await getLiftMetrics("campaign-123");

      expect(result).toEqual({
        control_conversion: 0.032,
        track15_conversion: 0.048,
        lift_percentage: 50.0,
        control_revenue: 45230,
        track15_revenue: 67845,
        revenue_lift: 50.0,
      });
    });

    it("should throw error when campaign not found", async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Campaign not found" },
            }),
          }),
        }),
      });

      await expect(getLiftMetrics("invalid-id")).rejects.toThrow(
        "Campaign not found",
      );
    });
  });

  describe("getSegmentPerformance", () => {
    it("should calculate segment performance from donations", async () => {
      const mockDonations = {
        data: [
          { amount: 100, donor_id: "d1", donor: { rfm_segment: "Champions" } },
          { amount: 200, donor_id: "d2", donor: { rfm_segment: "Champions" } },
          { amount: 50, donor_id: "d3", donor: { rfm_segment: "Loyal" } },
        ],
        error: null,
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockDonations),
        }),
      });

      const result = await getSegmentPerformance("campaign-123");

      expect(result).toHaveLength(7); // 7 RFM segments
      const champions = result.find((s) => s.segment_name === "Champions");
      expect(champions?.donor_count).toBe(2);
      expect(champions?.total_gifts).toBe(300);
    });
  });
});
```

---

### 3. Component Tests

Test individual components in isolation.

#### Track15LiftMetrics.test.tsx

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Track15LiftMetrics from "@/components/analytics/Track15LiftMetrics";

describe("Track15LiftMetrics", () => {
  it("should display lift percentage correctly", () => {
    const mockMetrics = {
      control_conversion: 0.032,
      track15_conversion: 0.048,
      lift_percentage: 50.0,
      control_revenue: 45230,
      track15_revenue: 67845,
      revenue_lift: 50.0,
    };

    render(<Track15LiftMetrics metrics={mockMetrics} />);

    expect(screen.getByText("50.0%")).toBeInTheDocument();
    expect(screen.getByText("Conversion Lift")).toBeInTheDocument();
  });

  it("should show loading state when metrics is null", () => {
    render(<Track15LiftMetrics metrics={null} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should format revenue correctly", () => {
    const mockMetrics = {
      control_conversion: 0.032,
      track15_conversion: 0.048,
      lift_percentage: 50.0,
      control_revenue: 45230,
      track15_revenue: 67845,
      revenue_lift: 50.0,
    };

    render(<Track15LiftMetrics metrics={mockMetrics} />);

    expect(screen.getByText("$45,230")).toBeInTheDocument();
    expect(screen.getByText("$67,845")).toBeInTheDocument();
  });
});
```

#### Track15SegmentPerformance.test.tsx

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Track15SegmentPerformance from "@/components/analytics/Track15SegmentPerformance";

describe("Track15SegmentPerformance", () => {
  const mockSegments = [
    {
      segment_name: "Champions",
      donor_count: 45,
      total_gifts: 12500,
      avg_gift_size: 277.78,
      lift_percentage: 52.3,
    },
    {
      segment_name: "Loyal",
      donor_count: 30,
      total_gifts: 6000,
      avg_gift_size: 200.0,
      lift_percentage: 35.2,
    },
  ];

  it("should render all segments", () => {
    render(<Track15SegmentPerformance segments={mockSegments} />);

    expect(screen.getByText("Champions")).toBeInTheDocument();
    expect(screen.getByText("Loyal")).toBeInTheDocument();
  });

  it("should display metrics correctly", () => {
    render(<Track15SegmentPerformance segments={mockSegments} />);

    expect(screen.getByText("45")).toBeInTheDocument(); // donor count
    expect(screen.getByText("$12,500")).toBeInTheDocument(); // total gifts
    expect(screen.getByText("$277.78")).toBeInTheDocument(); // avg gift
    expect(screen.getByText("52.3%")).toBeInTheDocument(); // lift
  });

  it("should sort segments by lift percentage descending", () => {
    render(<Track15SegmentPerformance segments={mockSegments} />);

    const rows = screen.getAllByRole("row");
    // First row after header should be Champions (highest lift)
    expect(rows[1]).toHaveTextContent("Champions");
    expect(rows[2]).toHaveTextContent("Loyal");
  });
});
```

---

### 4. Integration Tests (Panels)

Test complete panels with all hooks and state management.

#### Track15AnalyticsPanel.test.tsx

```typescript
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Track15AnalyticsPanel from "@/panels/Track15AnalyticsPanel";
import { ClientProvider } from "@/context/ClientContext";
import * as track15Service from "@/services/track15Service";
import { supabase } from "@/lib/supabaseClient";

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockClient = { id: "client-123", name: "Test Client" };

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ClientProvider value={{ currentClient: mockClient }}>
        {ui}
      </ClientProvider>
    </BrowserRouter>
  );
};

describe("Track15AnalyticsPanel", () => {
  it("should fetch and display campaigns in selector", async () => {
    const mockCampaigns = [
      {
        id: "c1",
        name: "Spring Appeal 2025",
        track15_enabled: true,
        track15_season: "spring",
      },
      {
        id: "c2",
        name: "Year-End 2024",
        track15_enabled: true,
        track15_season: "year_end",
      },
    ];

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockCampaigns,
            error: null,
          }),
        }),
      }),
    });

    renderWithProviders(<Track15AnalyticsPanel />);

    await waitFor(() => {
      expect(screen.getByText("Spring Appeal 2025")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox");
    expect(within(select).getByText("Spring Appeal 2025")).toBeInTheDocument();
    expect(within(select).getByText("Year-End 2024")).toBeInTheDocument();
  });

  it("should auto-select first campaign", async () => {
    const mockCampaigns = [
      { id: "c1", name: "Spring Appeal", track15_enabled: true, track15_season: "spring" },
    ];

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockCampaigns,
            error: null,
          }),
        }),
      }),
    });

    const metricsSpy = vi.spyOn(track15Service, "getLiftMetrics").mockResolvedValue({} as any);

    renderWithProviders(<Track15AnalyticsPanel />);

    await waitFor(() => {
      expect(metricsSpy).toHaveBeenCalledWith("c1");
    });
  });

  it("should update data when campaign selection changes", async () => {
    const user = userEvent.setup();
    const mockCampaigns = [
      { id: "c1", name: "Campaign 1", track15_enabled: true, track15_season: "spring" },
      { id: "c2", name: "Campaign 2", track15_enabled: true, track15_season: "summer" },
    ];

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockCampaigns,
            error: null,
          }),
        }),
      }),
    });

    const metricsSpy = vi.spyOn(track15Service, "getLiftMetrics").mockResolvedValue({} as any);

    renderWithProviders(<Track15AnalyticsPanel />);

    await waitFor(() => {
      expect(screen.getByText("Campaign 1")).toBeInTheDocument();
    });

    // Change selection
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "c2");

    await waitFor(() => {
      expect(metricsSpy).toHaveBeenCalledWith("c2");
    });
  });

  it("should show empty state when no campaigns", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    renderWithProviders(<Track15AnalyticsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/no track15 campaigns/i)).toBeInTheDocument();
    });
  });

  it("should pre-select campaign from campaignId prop", async () => {
    const mockCampaigns = [
      { id: "c1", name: "Campaign 1", track15_enabled: true, track15_season: "spring" },
      { id: "c2", name: "Campaign 2", track15_enabled: true, track15_season: "summer" },
    ];

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockCampaigns,
            error: null,
          }),
        }),
      }),
    });

    const metricsSpy = vi.spyOn(track15Service, "getLiftMetrics").mockResolvedValue({} as any);

    renderWithProviders(<Track15AnalyticsPanel campaignId="c2" />);

    await waitFor(() => {
      expect(metricsSpy).toHaveBeenCalledWith("c2");
    });

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("c2");
  });
});
```

#### Track15CampaignWizard.test.tsx

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Track15CampaignWizard from "@/panels/Track15CampaignWizard";
import { ClientProvider } from "@/context/ClientContext";
import { supabase } from "@/lib/supabaseClient";

vi.mock("@/lib/supabaseClient");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ clientId: "client-123" }),
  };
});

const mockClient = { id: "client-123", name: "Test Client" };

const renderWizard = () => {
  return render(
    <BrowserRouter>
      <ClientProvider value={{ currentClient: mockClient }}>
        <Track15CampaignWizard />
      </ClientProvider>
    </BrowserRouter>
  );
};

describe("Track15CampaignWizard", () => {
  it("should render step 1 (Basics) initially", () => {
    renderWizard();

    expect(screen.getByText("Campaign Basics")).toBeInTheDocument();
    expect(screen.getByLabelText(/campaign name/i)).toBeInTheDocument();
  });

  it("should validate campaign name before proceeding", async () => {
    const user = userEvent.setup();
    renderWizard();

    const nextButton = screen.getByText("Next");
    await user.click(nextButton);

    // Should not proceed without name
    expect(screen.getByText("Campaign Basics")).toBeInTheDocument();
  });

  it("should proceed to step 2 with valid name", async () => {
    const user = userEvent.setup();
    renderWizard();

    const nameInput = screen.getByLabelText(/campaign name/i);
    await user.type(nameInput, "Spring Appeal 2025");

    const nextButton = screen.getByText("Next");
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Select Season")).toBeInTheDocument();
    });
  });

  it("should navigate back to previous step", async () => {
    const user = userEvent.setup();
    renderWizard();

    // Go to step 2
    await user.type(screen.getByLabelText(/campaign name/i), "Test Campaign");
    await user.click(screen.getByText("Next"));

    await waitFor(() => {
      expect(screen.getByText("Select Season")).toBeInTheDocument();
    });

    // Go back
    await user.click(screen.getByText("Back"));

    await waitFor(() => {
      expect(screen.getByText("Campaign Basics")).toBeInTheDocument();
    });
  });

  it("should complete full wizard flow", async () => {
    const user = userEvent.setup();

    const mockInsert = vi.fn().mockResolvedValue({
      data: { id: "new-campaign-id" },
      error: null,
    });

    (supabase.from as any).mockReturnValue({
      insert: mockInsert,
      update: vi.fn().mockResolvedValue({ error: null }),
    });

    renderWizard();

    // Step 1: Basics
    await user.type(screen.getByLabelText(/campaign name/i), "Spring Appeal");
    await user.click(screen.getByText("Next"));

    // Step 2: Season
    await waitFor(() => screen.getByText("Select Season"));
    await user.click(screen.getByText("Spring Cultivation"));
    await user.click(screen.getByText("Next"));

    // Step 3: Core Story
    await waitFor(() => screen.getByText("Core Story"));
    await user.type(screen.getByLabelText(/headline/i), "Help Feed Families");
    await user.type(screen.getByLabelText(/summary/i), "Every donation helps");
    await user.type(screen.getByLabelText(/value prop/i), "Impact");
    await user.type(screen.getByLabelText(/motivation/i), "Compassion");
    await user.click(screen.getByText("Next"));

    // Step 4: Narrative Arc
    await waitFor(() => screen.getByText("Narrative Arc"));
    // Add at least one narrative step
    await user.click(screen.getByText("Add Step"));
    await user.click(screen.getByText("Next"));

    // Step 5: Review
    await waitFor(() => screen.getByText("Review"));
    await user.click(screen.getByText("Create Campaign"));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });
  });
});
```

---

### 5. Navigation Tests

Test routing and navigation flows.

#### Track15Navigation.test.tsx

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ClientCampaigns from "@/pages/client/ClientCampaigns";
import Track15Analytics from "@/pages/client/Track15Analytics";
import KnowledgeBasePanel from "@/panels/KnowledgeBasePanel";

describe("Track15 Navigation", () => {
  it("should navigate from campaign list to analytics", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/clients/123/campaigns"]}>
        <Routes>
          <Route path="/clients/:clientId/campaigns" element={<ClientCampaigns />} />
          <Route path="/clients/:clientId/track15" element={<Track15Analytics />} />
        </Routes>
      </MemoryRouter>
    );

    // Find Track15 campaign with Analytics button
    const analyticsButton = screen.getByText("Analytics");
    await user.click(analyticsButton);

    await waitFor(() => {
      expect(screen.getByText(/track15 analytics/i)).toBeInTheDocument();
    });
  });

  it("should navigate from Knowledge Base to wizard", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/clients/123/knowledge"]}>
        <Routes>
          <Route path="/clients/:clientId/knowledge" element={<KnowledgeBasePanel />} />
          <Route path="/clients/:clientId/campaigns/new/track15" element={<div>Wizard</div>} />
        </Routes>
      </MemoryRouter>
    );

    const createButton = screen.getByText("Create Track15 Campaign");
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Wizard")).toBeInTheDocument();
    });
  });

  it("should pass campaign ID via query parameter", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/clients/123/campaigns"]}>
        <Routes>
          <Route path="/clients/:clientId/campaigns" element={<ClientCampaigns />} />
          <Route path="/clients/:clientId/track15" element={<Track15Analytics />} />
        </Routes>
      </MemoryRouter>
    );

    const analyticsButton = screen.getByText("Analytics");
    await user.click(analyticsButton);

    // Verify URL contains campaign query param
    expect(window.location.search).toContain("campaign=");
  });
});
```

---

### 6. E2E User Journeys

Test complete user workflows from start to finish.

#### Track15UserJourneys.test.tsx

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { supabase } from "@/lib/supabaseClient";

vi.mock("@/lib/supabaseClient");

describe("Track15 User Journeys", () => {
  it("Journey 1: Create campaign and view analytics", async () => {
    const user = userEvent.setup();

    // Mock successful campaign creation
    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockResolvedValue({
        data: { id: "new-campaign" },
        error: null,
      }),
      update: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              id: "new-campaign",
              name: "Test Campaign",
              track15_enabled: true,
            },
          ],
          error: null,
        }),
      }),
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Step 1: Navigate to wizard
    await user.click(screen.getByText("New Track15 Campaign"));

    // Step 2: Complete wizard
    await user.type(screen.getByLabelText(/campaign name/i), "Test Campaign");
    // ... complete all steps ...

    // Step 3: View in campaigns list
    await waitFor(() => {
      expect(screen.getByText("Test Campaign")).toBeInTheDocument();
    });

    // Step 4: Navigate to analytics
    await user.click(screen.getByText("Analytics"));

    await waitFor(() => {
      expect(screen.getByText(/lift metrics/i)).toBeInTheDocument();
    });
  });

  it("Journey 2: Knowledge Base → Campaign Creation", async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Navigate to Knowledge Base
    await user.click(screen.getByText("Knowledge Base"));

    // Click Create Track15 Campaign
    await user.click(screen.getByText("Create Track15 Campaign"));

    await waitFor(() => {
      expect(screen.getByText("Campaign Basics")).toBeInTheDocument();
    });
  });
});
```

---

## Test Data Setup

### Mock Data Helpers

```typescript
// src/test/helpers/track15MockData.ts

export const mockTrack15Campaign = {
  id: "campaign-123",
  name: "Spring Appeal 2025",
  client_id: "client-123",
  track15_enabled: true,
  track15_season: "spring",
  track15_stage: "ready_for_launch",
  track15_core_story: {
    headline: "Help Feed Families This Spring",
    summary: "Your gift provides meals to families in need",
    value_proposition: "Every $50 feeds a family for a week",
    donor_motivation: "Make a tangible impact in your community",
  },
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

export const mockLiftMetrics = {
  control_conversion: 0.032,
  track15_conversion: 0.048,
  lift_percentage: 50.0,
  control_revenue: 45230,
  track15_revenue: 67845,
  revenue_lift: 50.0,
};

export const mockSegmentPerformance = [
  {
    segment_name: "Champions",
    donor_count: 45,
    total_gifts: 12500,
    avg_gift_size: 277.78,
    lift_percentage: 52.3,
  },
  {
    segment_name: "Loyal",
    donor_count: 30,
    total_gifts: 6000,
    avg_gift_size: 200.0,
    lift_percentage: 35.2,
  },
  {
    segment_name: "Potential",
    donor_count: 25,
    total_gifts: 3750,
    avg_gift_size: 150.0,
    lift_percentage: 28.1,
  },
];

export const mockRetentionData = {
  series: [
    {
      stage: "awareness",
      donors: 1000,
      retention_rate: 100,
      cumulative_revenue: 0,
    },
    {
      stage: "engagement",
      donors: 800,
      retention_rate: 80,
      cumulative_revenue: 15000,
    },
    {
      stage: "consideration",
      donors: 600,
      retention_rate: 60,
      cumulative_revenue: 35000,
    },
    {
      stage: "conversion",
      donors: 450,
      retention_rate: 45,
      cumulative_revenue: 67845,
    },
    {
      stage: "gratitude",
      donors: 400,
      retention_rate: 40,
      cumulative_revenue: 72000,
    },
  ],
};
```

### MSW Handlers for Track15

```typescript
// Add to src/test/msw/handlers.ts

import { http, HttpResponse } from "msw";
import {
  mockTrack15Campaign,
  mockLiftMetrics,
  mockSegmentPerformance,
  mockRetentionData,
} from "../helpers/track15MockData";

export const track15Handlers = [
  // Get Track15 campaigns
  http.get("/rest/v1/campaigns", ({ request }) => {
    const url = new URL(request.url);
    const track15Enabled = url.searchParams.get("track15_enabled");

    if (track15Enabled === "eq.true") {
      return HttpResponse.json([mockTrack15Campaign]);
    }

    return HttpResponse.json([]);
  }),

  // Get lift metrics (via campaign data)
  http.get("/rest/v1/campaigns", ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id === `eq.${mockTrack15Campaign.id}`) {
      return HttpResponse.json({
        ...mockTrack15Campaign,
        track15_control_conversion: mockLiftMetrics.control_conversion,
        track15_test_conversion: mockLiftMetrics.track15_conversion,
        track15_control_revenue: mockLiftMetrics.control_revenue,
        track15_test_revenue: mockLiftMetrics.track15_revenue,
      });
    }

    return HttpResponse.json(null, { status: 404 });
  }),

  // Get donations for segment performance
  http.get("/rest/v1/donations", ({ request }) => {
    const url = new URL(request.url);
    const campaignId = url.searchParams.get("campaign_id");

    if (campaignId === `eq.${mockTrack15Campaign.id}`) {
      // Return mock donation data that will calculate to segment performance
      return HttpResponse.json([
        { amount: 277.78, donor_id: "d1", donor: { rfm_segment: "Champions" } },
        { amount: 200.0, donor_id: "d2", donor: { rfm_segment: "Loyal" } },
        { amount: 150.0, donor_id: "d3", donor: { rfm_segment: "Potential" } },
      ]);
    }

    return HttpResponse.json([]);
  }),
];
```

---

## Running Tests

### Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test useTrack15Metrics.test.ts

# Run tests matching pattern
pnpm test Track15
```

### Coverage Goals

- **Hooks**: 90%+ coverage
- **Services**: 85%+ coverage
- **Components**: 80%+ coverage
- **Panels**: 75%+ coverage
- **Navigation**: 70%+ coverage

---

## Test Organization

### Directory Structure

```
src/
├── test/
│   ├── setup.ts                           # Global test setup
│   ├── msw/
│   │   ├── server.ts                      # MSW server
│   │   ├── handlers.ts                    # API mock handlers
│   │   └── track15Handlers.ts             # Track15-specific handlers
│   ├── helpers/
│   │   ├── track15MockData.ts             # Shared mock data
│   │   └── renderHelpers.tsx              # Custom render utilities
│   ├── hooks/
│   │   ├── useTrack15Metrics.test.ts
│   │   ├── useTrack15Segments.test.ts
│   │   └── useTrack15Retention.test.ts
│   ├── services/
│   │   └── track15Service.test.ts
│   ├── components/
│   │   ├── Track15LiftMetrics.test.tsx
│   │   ├── Track15SegmentPerformance.test.tsx
│   │   └── Track15RetentionChart.test.tsx
│   ├── panels/
│   │   ├── Track15AnalyticsPanel.test.tsx
│   │   └── Track15CampaignWizard.test.tsx
│   └── integration/
│       ├── Track15Navigation.test.tsx
│       └── Track15UserJourneys.test.tsx
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
```

---

## Testing Best Practices

### 1. Test Naming Convention

```typescript
// ✅ Good: Descriptive test names
it("should display lift percentage when metrics are provided", () => {});
it("should show loading state while fetching campaign data", () => {});
it("should navigate to analytics page when Analytics button is clicked", () => {});

// ❌ Bad: Vague test names
it("works", () => {});
it("test1", () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it("should calculate lift percentage correctly", () => {
  // Arrange
  const mockMetrics = {
    control_conversion: 0.03,
    track15_conversion: 0.045,
  };

  // Act
  const liftPercentage = calculateLift(mockMetrics);

  // Assert
  expect(liftPercentage).toBe(50.0);
});
```

### 3. Test Isolation

```typescript
// ✅ Good: Each test is independent
beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

// ❌ Bad: Tests depend on each other
let sharedState;
it("test 1", () => {
  sharedState = { data: "test" };
});
it("test 2", () => {
  expect(sharedState.data).toBe("test"); // Depends on test 1
});
```

### 4. Mock Only What's Necessary

```typescript
// ✅ Good: Mock external dependencies
vi.mock("@/lib/supabaseClient");

// ❌ Bad: Mock internal functions you're testing
vi.mock("@/hooks/useTrack15Metrics"); // Don't mock what you're testing
```

### 5. Test User Behavior, Not Implementation

```typescript
// ✅ Good: Test from user's perspective
await user.click(screen.getByRole("button", { name: "Submit" }));
expect(screen.getByText("Success!")).toBeInTheDocument();

// ❌ Bad: Test implementation details
expect(component.state.isSubmitting).toBe(true);
expect(handleSubmit).toHaveBeenCalled();
```

---

## Known Testing Challenges

### 1. Recharts Testing

**Challenge:** Recharts components are difficult to test due to SVG rendering complexity.

**Solution:** Test data transformation instead of chart rendering:

```typescript
// Test the data preparation, not the chart itself
it("should format retention data for chart", () => {
  const data = prepareRetentionChartData(mockRetentionData);
  expect(data).toHaveLength(5);
  expect(data[0]).toHaveProperty("stage");
  expect(data[0]).toHaveProperty("donors");
});
```

### 2. Supabase Client Mocking

**Challenge:** Supabase client has complex chaining API.

**Solution:** Use a factory function for consistent mocking:

```typescript
const mockSupabaseQuery = (data: any, error: any = null) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data, error }),
  order: vi.fn().mockReturnThis(),
});
```

### 3. Router Context

**Challenge:** Components using `useNavigate` need Router context.

**Solution:** Create a custom render helper:

```typescript
const renderWithRouter = (ui: React.ReactElement, { initialRoute = "/" } = {}) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      {ui}
    </MemoryRouter>
  );
};
```

---

## Implementation Priority

### Phase 1: Critical Path (High Priority)

1. **Hook Tests** (useTrack15Metrics, useTrack15Segments)
   - These are the foundation for all other components
   - Quick to write, high value

2. **Service Tests** (track15Service.ts)
   - Validates business logic
   - Catches calculation errors

### Phase 2: User-Facing (Medium Priority)

3. **Component Tests** (LiftMetrics, SegmentPerformance)
   - Ensure UI displays data correctly
   - Validates formatting

4. **Panel Tests** (Track15AnalyticsPanel)
   - Integration of all pieces
   - Campaign selector logic

### Phase 3: Workflows (Lower Priority)

5. **Wizard Tests** (Track15CampaignWizard)
   - Multi-step flow validation
   - Form validation

6. **Navigation Tests**
   - Routing logic
   - Query parameters

### Phase 4: E2E (Nice to Have)

7. **User Journey Tests**
   - Complete workflows
   - Catch integration issues

---

## Success Metrics

### Test Suite Health

- ✅ All tests pass on CI
- ✅ Coverage > 80% overall
- ✅ No flaky tests
- ✅ Test suite runs < 30 seconds
- ✅ Zero test warnings

### Code Quality

- ✅ All hooks have tests
- ✅ All services have tests
- ✅ All critical components have tests
- ✅ All user journeys have tests
- ✅ All edge cases covered

---

## Next Steps

1. **Start with Phase 1** - Write hook and service tests first
2. **Add to CI/CD** - Integrate tests into GitHub Actions
3. **Monitor Coverage** - Use Codecov for coverage tracking
4. **Iterative Improvement** - Add tests as bugs are found
5. **Documentation** - Keep this plan updated as tests are written

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

_Last Updated: 2025-01-14_
_Status: DOCUMENTED - Ready for Implementation_
