import { Input } from "@/components/ui-kit/Input";
import { SectionBlock } from "@/components/ui-kit/SectionBlock";
import { TextArea } from "@/components/ui-kit/TextArea";

import { CampaignDraft } from "../campaignEditor.types";

interface Props {
  campaign: CampaignDraft;
  updateCampaign: (data: Partial<CampaignDraft>) => void;
}

export default function OverviewStep({ campaign, updateCampaign }: Props) {
  const data = campaign.overview || {};

  return (
    <div className="space-y-10">
      <SectionBlock
        title="Campaign Overview"
        description="Give your campaign a clear foundation that guides all deliverables."
      >
        <div className="space-y-6">
          <Input
            label="Campaign Title"
            placeholder="Example: Summer Hope Campaign"
            value={data.title || ""}
            onChange={(e) =>
              updateCampaign({
                overview: { ...data, title: e.target.value },
              })
            }
          />

          <Input
            label="Season or Theme"
            placeholder="Example: Summer, Back-to-School, Winter Relief"
            value={data.season || ""}
            onChange={(e) =>
              updateCampaign({
                overview: { ...data, season: e.target.value },
              })
            }
          />

          <TextArea
            label="Campaign Summary"
            rows={4}
            placeholder="Describe what this campaign is about, its focus, and intended impact."
            value={data.summary || ""}
            onChange={(e) =>
              updateCampaign({
                overview: { ...data, summary: e.target.value },
              })
            }
          />
        </div>
      </SectionBlock>
    </div>
  );
}
