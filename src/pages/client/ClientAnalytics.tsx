import { AsyncBoundary } from "@/components/system/AsyncBoundary";
import { FeatureErrorBoundary } from "@/components/system/ErrorBoundary";
import DonorIntelligencePanel from "@/panels/DonorIntelligencePanel";

export default function ClientAnalytics() {
  return (
    <FeatureErrorBoundary featureName="Donor Intelligence">
      <AsyncBoundary>
        <DonorIntelligencePanel />
      </AsyncBoundary>
    </FeatureErrorBoundary>
  );
}
