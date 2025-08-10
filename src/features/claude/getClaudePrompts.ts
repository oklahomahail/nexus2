import { Campaign } from "../../models/campaign";

// Generate contextual prompts for different Claude actions
export function getClaudePrompt(
  actionType: string,
  campaign: Campaign,
): string {
  const campaignInfo = `Campaign: ${campaign.name || "Unnamed Campaign"}
Goal: $${campaign.goal?.toLocaleString() || "Not set"}
Raised: $${campaign.raised?.toLocaleString() || "0"}
Description: ${campaign.description || "No description provided"}`;

  const prompts: Record<string, string> = {
    campaign_help: `I need help with campaign strategy and planning.

${campaignInfo}

Please provide specific, actionable advice for improving this campaign's performance.`,

    content_creation: `Help me create compelling content for this fundraising campaign.

${campaignInfo}

Please suggest content ideas, messaging strategies, or draft content that would resonate with potential donors.`,

    donor_outreach: `I need help with donor outreach and communication strategies.

${campaignInfo}

Please suggest effective approaches for reaching potential donors, including email templates, social media strategies, or other outreach methods.`,

    campaign_optimization: `Help me optimize this campaign for better results.

${campaignInfo}

Please analyze what could be improved and provide specific recommendations for increasing donations and engagement.`,

    social_media: `Create social media content for this campaign.

${campaignInfo}

Please suggest posts, hashtags, and social media strategies to promote this campaign effectively.`,

    email_campaign: `Help me create an email campaign for fundraising.

${campaignInfo}

Please draft compelling email content that would motivate people to donate to this campaign.`,

    press_release: `Help me write a press release for this campaign.

${campaignInfo}

Please create a professional press release that would attract media attention and potential donors.`,

    donor_thank_you: `Help me create thank you messages for donors.

${campaignInfo}

Please draft heartfelt thank you messages that show appreciation and encourage continued support.`,

    campaign_update: `Help me write a campaign progress update.

${campaignInfo}

Please create an engaging update that shows progress and maintains donor interest.`,

    fundraising_ideas: `Suggest creative fundraising ideas for this campaign.

${campaignInfo}

Please provide innovative fundraising strategies and event ideas that could boost donations.`,
  };

  return (
    prompts[actionType] ||
    `Help me with this campaign: ${actionType}

${campaignInfo}

Please provide relevant advice and suggestions.`
  );
}
