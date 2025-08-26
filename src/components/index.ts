// src/components/index.ts
// Core components that are used frequently - keep these
export { default as Sidebar } from "./Sidebar";
export { default as Topbar } from "./Topbar";
export { default as LoadingSpinner } from "./LoadingSpinner";

// Lightweight components
export { default as IconButton } from "./IconButton";
export { default as IconBadge } from "./IconBadge";
export { default as LoginForm } from "./LoginForm";

// UI kit components - frequently used
export { Card, Input, Panel } from "./ui-kit";

// REMOVED: Heavy components that should be imported directly when needed
// - CampaignList, CampaignModal, PerformanceChart (import directly in panels)
// - DonorInsightsPanel (import directly where used)
// - ComparativeCampaignAnalysis (analytics feature, should be lazy loaded)

// These should now be imported like:
// import CampaignList from "@/components/CampaignList";
// instead of import { CampaignList } from "@/components";
