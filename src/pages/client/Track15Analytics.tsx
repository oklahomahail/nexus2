/**
 * Track15 Analytics Page
 *
 * Wrapper for Track15AnalyticsPanel
 */

import { useSearchParams } from "react-router-dom";
import Track15AnalyticsPanel from "@/panels/Track15AnalyticsPanel";

export default function Track15Analytics() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaign") || undefined;

  return <Track15AnalyticsPanel campaignId={campaignId} />;
}
