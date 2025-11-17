import { useState, useEffect } from "react";
import { CampaignDraft, CampaignStep } from "../campaignEditor.types";
import {
  campaignPersistenceService,
  SaveStatus,
} from "@/services/campaignPersistenceService";

export function useCampaignEditor(initial: CampaignDraft) {
  const [campaign, setCampaign] = useState<CampaignDraft>(initial);
  const [step, setStep] = useState<CampaignStep>("overview");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    saving: false,
    lastSaved: null,
    error: null,
  });

  // Initialize: Load from local storage if available (draft recovery)
  useEffect(() => {
    const hasLocal = campaignPersistenceService.hasLocalDraft(initial.id);

    if (hasLocal) {
      const localDraft = campaignPersistenceService.loadFromLocalStorage(
        initial.id,
      );
      if (localDraft) {
        console.log("Recovered draft from local storage:", initial.id);
        setCampaign(localDraft);
      }
    }

    // Register for save status updates
    campaignPersistenceService.onSaveStatusChange((status) => {
      setSaveStatus(status);
    });

    // Cleanup on unmount
    return () => {
      campaignPersistenceService.resetStatus();
    };
  }, [initial.id]);

  function updateCampaign(data: Partial<CampaignDraft>) {
    setCampaign((prev) => {
      const updated = { ...prev, ...data };
      // Trigger autosave (debounced)
      campaignPersistenceService.autosave(updated);
      return updated;
    });
  }

  function goNext() {
    const order: CampaignStep[] = [
      "overview",
      "theme",
      "audience",
      "deliverables",
      "review-draft",
      "publish",
    ];

    const idx = order.indexOf(step);
    if (idx < order.length - 1) setStep(order[idx + 1]);
  }

  function goBack() {
    const order: CampaignStep[] = [
      "overview",
      "theme",
      "audience",
      "deliverables",
      "review-draft",
      "publish",
    ];

    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  function setStepSafe(next: CampaignStep) {
    setStep(next);
  }

  async function forceSave() {
    return campaignPersistenceService.forceSave(campaign);
  }

  return {
    step,
    setStep: setStepSafe,
    campaign,
    updateCampaign,
    goNext,
    goBack,
    saveStatus,
    forceSave,
  };
}
