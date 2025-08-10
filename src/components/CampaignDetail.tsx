import { useEffect, useState } from "react";

import Card from "@/components/ui-kit/Card";
import { Input } from "@/components/ui-kit/Input";
import ClaudeToolbar from "@/features/claude/ClaudeToolbar";
import useAutoSave from "@/hooks/useAutoSave";
import type { Campaign } from "@/models/campaign";
import { createManualBackup } from "@/services/backup/backupService";

interface CampaignDetailProps {
  campaign: Campaign;
}

interface __BackupPayload {
  type: "campaignNotes";
  id: string;
  payload: string;
}

export default function CampaignDetail({ campaign }: CampaignDetailProps) {
  const [name, setName] = useState(campaign.name ?? "");
  const [notes, setNotes] = useState<string>(campaign.notes ?? "");

  // Persist notes locally and queue backup
  useAutoSave({
    key: `campaign:${campaign.id}:notes`,
    data: notes,
    onSave: async (payload: string) => {
      try {
        await createManualBackup(
          { notes: payload },
          `Campaign Notes: ${name}`,
          `Notes for campaign ${campaign.id}`,
        );
      } catch {
        // silent: the backup card will surface health state
      }
    },
  });

  // keep local state in sync if parent campaign changes
  useEffect(() => {
    setName(campaign.name ?? "");
    setNotes(campaign.notes ?? "");
  }, [campaign.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Campaign details</div>
        <div className="grid grid-cols-1 gap-3">
          <label className="text-xs text-gray-600">Name</label>
          <Input
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            placeholder="Campaign name"
          />
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Notes</div>
        <ClaudeToolbar
          context={{
            campaignName: name,
            // add anything else you track: goals, audience, dates, etc.
          }}
          onInsert={(text: string) =>
            setNotes((n) => (n ? `${n}\n\n${text}` : text))
          }
        />
        <textarea
          className="mt-3 w-full h-48 rounded-md border border-gray-200 p-3 text-sm outline-none focus:ring"
          placeholder="Notes save automatically"
          value={notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setNotes(e.target.value)
          }
        />
      </Card>
    </div>
  );
}
