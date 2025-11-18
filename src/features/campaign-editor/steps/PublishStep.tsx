import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui-kit/Button";
import { SectionBlock } from "@/components/ui-kit/SectionBlock";
import { campaignAiService } from "@/services/campaignAiService";
import { campaignPersistenceService } from "@/services/campaignPersistenceService";

import { CampaignDraft } from "../campaignEditor.types";

interface Props {
  campaign: CampaignDraft;
  onPublish?: () => void;
}

export default function PublishStep({ campaign, onPublish }: Props) {
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  async function handlePublish() {
    setPublishing(true);
    setError(null);

    try {
      // 1. Generate email series
      setProgress("Generating email series...");
      const emailCount = campaign.deliverables?.emailCount || 10;
      const emailResult = await campaignAiService.generateEmailSeries(
        campaign,
        emailCount,
      );

      if (emailResult.error) {
        throw new Error(emailResult.error);
      }

      // 2. Generate social posts
      setProgress("Generating social posts...");
      const socialCount = campaign.deliverables?.socialCount || 10;
      const socialResult = await campaignAiService.generateSocialPosts(
        campaign,
        socialCount,
      );

      if (socialResult.error) {
        throw new Error(socialResult.error);
      }

      // 3. Generate direct mail (if requested)
      let directMail: string | undefined;
      if (campaign.deliverables?.includeDirectMail) {
        setProgress("Generating direct mail copy...");
        const dmResult = await campaignAiService.generateDirectMail(campaign);

        if (dmResult.error) {
          throw new Error(dmResult.error);
        }

        directMail = dmResult.copy;
      }

      // 4. Generate creative brief
      setProgress("Generating creative brief...");
      const creativeBrief =
        await campaignAiService.generateCreativeBrief(campaign);

      // 5. Publish everything
      setProgress("Publishing campaign...");
      await campaignPersistenceService.publish(campaign, {
        emails: emailResult.emails,
        posts: socialResult.posts,
        directMail,
        creativeBrief,
      });

      // 6. Call custom onPublish if provided, otherwise navigate
      if (onPublish) {
        onPublish();
      } else {
        void navigate(`/clients/${campaign.clientId}/campaigns/${campaign.id}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to publish campaign",
      );
    } finally {
      setPublishing(false);
      setProgress("");
    }
  }

  const emailCount = campaign.deliverables?.emailCount || 10;
  const socialCount = campaign.deliverables?.socialCount || 10;
  const includeDirectMail = campaign.deliverables?.includeDirectMail || false;

  return (
    <div className="space-y-10">
      <SectionBlock
        title="Publish Campaign"
        description="Finalize your campaign and make it available for activation."
      >
        <div className="space-y-6">
          {/* Campaign Summary */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h3 className="font-medium text-[var(--nx-charcoal)]">
              Campaign Summary
            </h3>

            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Title</dt>
                <dd className="font-medium text-[var(--nx-charcoal)]">
                  {campaign.overview?.title || "Untitled"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Season</dt>
                <dd className="font-medium text-[var(--nx-charcoal)]">
                  {campaign.overview?.season || "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Email Count</dt>
                <dd className="font-medium text-[var(--nx-charcoal)]">
                  {emailCount} emails
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Social Posts</dt>
                <dd className="font-medium text-[var(--nx-charcoal)]">
                  {socialCount} posts
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Direct Mail</dt>
                <dd className="font-medium text-[var(--nx-charcoal)]">
                  {includeDirectMail ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-[var(--nx-charcoal)]">
              Publishing will generate all campaign deliverables using AI. This
              may take 30-60 seconds.
            </p>
          </div>

          {/* Progress Indicator */}
          {progress && (
            <div className="bg-gray-50 p-4 rounded text-center">
              <div className="animate-pulse text-[var(--nx-charcoal)]">
                {progress}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded">{error}</div>
          )}

          {/* Publish Button */}
          <Button
            variant="primary"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "Publishing..." : "Publish Campaign"}
          </Button>
        </div>
      </SectionBlock>
    </div>
  );
}
