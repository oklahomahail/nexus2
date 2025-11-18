import { Input } from "@/components/ui-kit/Input";
import { SectionBlock } from "@/components/ui-kit/SectionBlock";
import { TextArea } from "@/components/ui-kit/TextArea";

import { CampaignDraft } from "../campaignEditor.types";

interface Props {
  campaign: CampaignDraft;
  updateCampaign: (data: Partial<CampaignDraft>) => void;
}

export default function AudienceStep({ campaign, updateCampaign }: Props) {
  const data = campaign.audience || {};

  return (
    <div className="space-y-10">
      <SectionBlock
        title="Target Audience"
        description="Identify who this campaign is designed for and how you'll speak to them."
      >
        <div className="space-y-6">
          <Input
            label="Key Segments"
            placeholder="Example: Current donors, lapsed donors, major donors, volunteers"
            value={data.segments?.join(", ") || ""}
            onChange={(e) =>
              updateCampaign({
                audience: {
                  ...data,
                  segments: e.target.value.split(",").map((s) => s.trim()),
                },
              })
            }
          />

          <TextArea
            label="Audience Insights"
            rows={4}
            placeholder="Motivations, concerns, emotional drivers relevant to this campaign."
            value={data.notes || ""}
            onChange={(e) =>
              updateCampaign({
                audience: { ...data, notes: e.target.value },
              })
            }
          />
        </div>
      </SectionBlock>
    </div>
  );
}
