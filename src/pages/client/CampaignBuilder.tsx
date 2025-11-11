import { AsyncBoundary } from "@/components/system/AsyncBoundary";
import { FeatureErrorBoundary } from "@/components/system/ErrorBoundary";
import CampaignDesignerWizard from "@/panels/CampaignDesignerWizard";

export default function CampaignBuilder() {
  return (
    <FeatureErrorBoundary featureName="Campaign Designer">
      <AsyncBoundary>
        <CampaignDesignerWizard />
      </AsyncBoundary>
    </FeatureErrorBoundary>
  );
}
