import { useState } from "react";

import { Button } from "@/components/ui-kit/Button";
import { SectionBlock } from "@/components/ui-kit/SectionBlock";
import { TextArea } from "@/components/ui-kit/TextArea";
import { campaignAiService } from "@/services/campaignAiService";

import { CampaignDraft } from "../campaignEditor.types";

interface Props {
  campaign: CampaignDraft;
  updateCampaign: (data: Partial<CampaignDraft>) => void;
}

export default function ReviewDraftStep({ campaign, updateCampaign }: Props) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draft = campaign.draftPreview || "";

  async function generateDraft() {
    setGenerating(true);
    setError(null);

    try {
      const narrative = await campaignAiService.generateNarrative(campaign);
      updateCampaign({ draftPreview: narrative });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate draft");
    } finally {
      setGenerating(false);
    }
  }

  async function regenerateDraft() {
    await generateDraft();
  }

  return (
    <div className="space-y-10">
      <SectionBlock
        title="Generated Draft"
        description="Review or refine the campaign's narrative foundation."
      >
        {!draft && (
          <div className="text-center py-8 space-y-4">
            <p className="text-[var(--nx-charcoal)]">
              Generate your campaign narrative to continue
            </p>
            <Button onClick={generateDraft} disabled={generating}>
              {generating ? "Generating..." : "Generate Draft"}
            </Button>
          </div>
        )}

        {draft && (
          <div className="space-y-4">
            <TextArea
              rows={12}
              value={draft}
              onChange={(e) =>
                updateCampaign({
                  draftPreview: e.target.value,
                })
              }
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={regenerateDraft}
                disabled={generating}
              >
                {generating ? "Regenerating..." : "Regenerate"}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded mt-4">{error}</div>
        )}
      </SectionBlock>
    </div>
  );
}
