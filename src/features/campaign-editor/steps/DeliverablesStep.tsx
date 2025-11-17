import { Input } from "@/components/ui-kit/Input";
import { TextArea } from "@/components/ui-kit/TextArea";
import { SectionBlock } from "@/components/ui-kit/SectionBlock";
import { CampaignDraft } from "../campaignEditor.types";

interface Props {
  campaign: CampaignDraft;
  updateCampaign: (data: Partial<CampaignDraft>) => void;
}

export default function DeliverablesStep({ campaign, updateCampaign }: Props) {
  const data = campaign.deliverables || {};

  function updateField(field: string, value: number | boolean | string) {
    updateCampaign({
      deliverables: { ...data, [field]: value },
    });
  }

  return (
    <div className="space-y-10">

      <SectionBlock
        title="Deliverables"
        description="Choose what assets the Campaign Engine will generate automatically."
      >
        <div className="space-y-6">

          <Input
            label="Email Count"
            type="number"
            value={data.emailCount || ""}
            onChange={(e) => updateField("emailCount", Number(e.target.value))}
          />

          <Input
            label="Social Media Count"
            type="number"
            value={data.socialCount || ""}
            onChange={(e) => updateField("socialCount", Number(e.target.value))}
          />

          <div>
            <label className="flex items-center gap-2 text-[var(--nx-charcoal)]">
              <input
                type="checkbox"
                checked={data.includeDirectMail || false}
                onChange={(e) =>
                  updateField("includeDirectMail", e.target.checked)
                }
              />
              Include Direct Mail Piece
            </label>
          </div>

          <TextArea
            label="Additional Notes"
            rows={4}
            placeholder="Anything else you want the system to generate or avoid."
            value={data.notes || ""}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>
      </SectionBlock>
    </div>
  );
}
