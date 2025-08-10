// src/features/claude/ClaudeToolbar.tsx
import { useState } from "react";

import { generateClaudeResponse } from "./claudeService";

type ClaudeContext = { purpose?: string } & Record<string, unknown>;

export interface ClaudeToolbarProps {
  context?: ClaudeContext;
  onInsert: (text: string) => void;
  className?: string;
}

export default function ClaudeToolbar({
  context,
  onInsert,
  className,
}: ClaudeToolbarProps) {
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    try {
      setLoading(true);
      const purpose = context?.purpose ?? "donor_email";

      // Create a simple prompt based on the purpose and context
      const prompt = createPromptFromContext(purpose, context ?? {});

      const res = await generateClaudeResponse(
        purpose,
        JSON.stringify(context ?? {}),
        {
          prompt,
          context: context ?? {},
        },
      );

      if (res.success) {
        onInsert(res.content || "");
      } else {
        onInsert("[Claude error: " + (res.error || "Unknown error") + "]");
      }
    } catch (e) {
      console.error(e);
      onInsert("[Claude error]");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleAsk}
        disabled={loading}
        className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Asking Claude…" : "Ask Claude"}
      </button>
    </div>
  );
}

// Helper function to create prompts from context
function createPromptFromContext(
  purpose: string,
  context: Record<string, unknown>,
): string {
  const campaignName = context.campaignName || "this campaign";

  const prompts: Record<string, string> = {
    donor_email: `Write a compelling donor outreach email for ${campaignName}.`,
    campaign_help: `Provide strategic advice for improving ${campaignName}.`,
    content_creation: `Create engaging content for ${campaignName}.`,
    social_media: `Write social media posts to promote ${campaignName}.`,
    thank_you: `Write a heartfelt thank you message for donors to ${campaignName}.`,
  };

  const basePrompt =
    prompts[purpose] || `Help with ${purpose} for ${campaignName}.`;

  // Add any additional context
  const contextStr = Object.entries(context)
    .filter(([key]) => key !== "purpose" && key !== "campaignName")
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  return contextStr ? `${basePrompt}\n\nContext: ${contextStr}` : basePrompt;
}
