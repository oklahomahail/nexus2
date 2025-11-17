import { useParams } from "react-router-dom";
import { useCampaignEditor } from "./hooks/useCampaignEditor";
import CampaignEditorLayout from "./CampaignEditorLayout";
import CampaignStepContent from "./CampaignStepContent";
import CampaignStepActions from "./CampaignStepActions";

import OverviewStep from "./steps/OverviewStep";
import ThemeStep from "./steps/ThemeStep";
import AudienceStep from "./steps/AudienceStep";
import DeliverablesStep from "./steps/DeliverablesStep";
import ReviewDraftStep from "./steps/ReviewDraftStep";
import PublishStep from "./steps/PublishStep";

import { PageHeading } from "@/components/ui-kit/PageHeading";
import { SaveStatusIndicator } from "./components/SaveStatusIndicator";

export default function CampaignEditorPage() {
  const { clientId, campaignId } = useParams();

  // TODO: Replace with real API fetch
  const initialDraft = {
    id: campaignId!,
    clientId: clientId!,
  };

  const {
    step,
    campaign,
    updateCampaign,
    goNext,
    goBack,
    saveStatus,
  } = useCampaignEditor(initialDraft);

  function renderStep() {
    return {
      "overview": (
        <OverviewStep
          campaign={campaign}
          updateCampaign={updateCampaign}
        />
      ),
      "theme": (
        <ThemeStep
          campaign={campaign}
          updateCampaign={updateCampaign}
        />
      ),
      "audience": (
        <AudienceStep
          campaign={campaign}
          updateCampaign={updateCampaign}
        />
      ),
      "deliverables": (
        <DeliverablesStep
          campaign={campaign}
          updateCampaign={updateCampaign}
        />
      ),
      "review-draft": (
        <ReviewDraftStep
          campaign={campaign}
          updateCampaign={updateCampaign}
        />
      ),
      "publish": (
        <PublishStep
          campaign={campaign}
          onPublish={() => {
            // TODO: Persist campaign + deliverables
            alert("Campaign published!");
          }}
        />
      ),
    }[step];
  }

  return (
    <CampaignEditorLayout step={step}>
      <div className="flex items-start justify-between mb-6">
        <PageHeading
          title="Campaign Builder"
          subtitle="Define strategy, messaging, and deliverables"
        />

        <div className="mt-2">
          <SaveStatusIndicator status={saveStatus} />
        </div>
      </div>

      <CampaignStepContent>{renderStep()}</CampaignStepContent>

      <CampaignStepActions
        showBack={step !== "overview"}
        showNext={step !== "publish"}
        onBack={goBack}
        onNext={goNext}
        nextLabel={step === "review-draft" ? "Proceed to Publish" : "Next"}
      />
    </CampaignEditorLayout>
  );
}
