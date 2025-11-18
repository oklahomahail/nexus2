import { Input } from "@/components/ui-kit/Input";
import { SectionBlock } from "@/components/ui-kit/SectionBlock";
import { TextArea } from "@/components/ui-kit/TextArea";

import { CampaignDraft } from "../campaignEditor.types";

interface Props {
  campaign: CampaignDraft;
  updateCampaign: (data: Partial<CampaignDraft>) => void;
}

export default function ThemeStep({ campaign, updateCampaign }: Props) {
  const data = campaign.theme || {};

  return (
    <div className="space-y-10">
      <SectionBlock
        title="Campaign Theme"
        description="Define the central story idea, tone, and creative direction that drive your message."
      >
        <div className="space-y-6">
          <Input
            label="Central Idea"
            placeholder="Example: No one thrives alone this summer"
            value={data.centralIdea || ""}
            onChange={(e) =>
              updateCampaign({
                theme: { ...data, centralIdea: e.target.value },
              })
            }
          />

          <Input
            label="Tone of Voice"
            placeholder="Warm, uplifting, urgent, grateful, etc."
            value={data.tone || ""}
            onChange={(e) =>
              updateCampaign({
                theme: { ...data, tone: e.target.value },
              })
            }
          />

          <TextArea
            label="Visual Notes"
            rows={4}
            placeholder="Describe photography style, colors, or imagery ideas."
            value={data.visualNotes || ""}
            onChange={(e) =>
              updateCampaign({
                theme: { ...data, visualNotes: e.target.value },
              })
            }
          />
        </div>
      </SectionBlock>
    </div>
  );
}
