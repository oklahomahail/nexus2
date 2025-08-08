// src/features/claude/getClaudePrompt.ts - Fixed to work with your Campaign interface
import { Campaign } from '@/models/campaign';

export const getClaudePrompt = (type: string, campaign: Campaign) => {
  if (!campaign) return 'Help me with a fundraising campaign.';

  // Safe property access with proper type handling
  const campaignName = campaign.name || 'Unnamed Campaign';
  const campaignGoal = campaign.goal || 0;
  const campaignRaised = campaign.raised || 0;
  
  // Handle ReactNode/any types safely
  const campaignProgress = typeof campaign.progress === 'number' ? campaign.progress : 
    (campaignGoal > 0 ? Math.round((campaignRaised / campaignGoal) * 100) : 0);
  
  const campaignDaysLeft = typeof campaign.daysLeft === 'number' ? campaign.daysLeft :
    calculateDaysLeft(campaign.endDate);
    
  const campaignDescription = campaign.description || 'No description provided';
  const campaignDeadline = campaign.endDate || 'No deadline set';
  const campaignDonorCount = campaign.donorCount || 0;
  const campaignAverageGift = campaign.averageGift || 0;
  
  // Optional performance metrics
  const emailsSent = campaign.emailsSent || 'Not tracked';
  const clickThroughRate = campaign.clickThroughRate || 'Not available';
  const conversionRate = campaign.conversionRate || 'Not available';

  switch (type) {
    case 'subject':
      return `Write 3 emotionally compelling subject lines for this fundraising campaign:

Campaign: ${campaignName}
Goal: ${campaignGoal.toLocaleString()}
Current Progress: ${campaignRaised.toLocaleString()} (${campaignProgress}% complete)
Deadline: ${campaignDeadline}
Days Remaining: ${campaignDaysLeft}
Status: ${campaign.status}
Focus: ${campaignDescription}

Make them urgent, personal, and action-oriented. Consider the time pressure with only ${campaignDaysLeft} days left.`;

    case 'email':
      return `Draft a compelling donor email for the campaign "${campaignName}". 

Campaign Details:
- Goal: ${campaignGoal.toLocaleString()}
- Raised so far: ${campaignRaised.toLocaleString()} (${campaignProgress}% complete)
- Days remaining: ${campaignDaysLeft}
- Deadline: ${campaignDeadline}
- Current donors: ${campaignDonorCount}
- Average gift: ${campaignAverageGift}
- Category: ${campaign.category}
- Target audience: ${campaign.targetAudience || 'General supporters'}
- Campaign focus: ${campaignDescription}

Create an email that includes:
- A warm, personal greeting
- A compelling story or reason to care  
- Clear progress update with urgency
- Specific ask amount suggestions (consider average gift of ${campaignAverageGift})
- Strong call to action
- Gratitude and next steps

Make it feel personal and urgent given the ${campaignDaysLeft} days remaining.`;

    case 'cta':
      return `Create 5 compelling call-to-action button texts for this campaign:

Campaign: ${campaignName}
Goal: ${campaignGoal.toLocaleString()}
Progress: ${campaignProgress}% complete
Days Left: ${campaignDaysLeft}
Category: ${campaign.category}
Average Gift: ${campaignAverageGift}
Focus: ${campaignDescription}

Make them:
- Short (2-4 words maximum)  
- Urgent and inspiring
- Action-oriented
- Varied in approach (direct ask, impact-focused, urgency-driven, community-focused, goal-oriented)
- Appropriate for ${campaign.category.toLowerCase()} campaigns`;

    case 'feedback':
      return `Analyze this campaign and provide 3 specific improvement recommendations:

Campaign Analysis:
- Name: ${campaignName}
- Category: ${campaign.category}
- Status: ${campaign.status}
- Goal: ${campaignGoal.toLocaleString()}
- Current: ${campaignRaised.toLocaleString()} (${campaignProgress}% complete)
- Days Remaining: ${campaignDaysLeft}
- Deadline: ${campaignDeadline}
- Donors: ${campaignDonorCount}
- Average Gift: ${campaignAverageGift}
- Target Audience: ${campaign.targetAudience || 'Not specified'}
- Description: ${campaignDescription}
${emailsSent !== 'Not tracked' ? `- Emails Sent: ${emailsSent}` : ''}
${clickThroughRate !== 'Not available' ? `- Click Rate: ${clickThroughRate}%` : ''}
${conversionRate !== 'Not available' ? `- Conversion Rate: ${conversionRate}%` : ''}

Provide actionable feedback on:
1. **Pacing & Performance:** Are we on track? What's the daily fundraising target needed?
2. **Donor Engagement:** How can we improve based on current donor count and average gift?
3. **Strategy & Optimization:** What specific actions should we prioritize for this ${campaign.category.toLowerCase()} campaign?

Be specific and actionable based on the current progress and time remaining.`;

    case 'strategy':
      return `Create a detailed action plan to successfully complete this campaign:

Campaign Overview:
- Name: ${campaignName}  
- Category: ${campaign.category}
- Status: ${campaign.status}
- Goal: ${campaignGoal.toLocaleString()}
- Current Progress: ${campaignRaised.toLocaleString()} (${campaignProgress}%)
- Amount Needed: ${(campaignGoal - campaignRaised).toLocaleString()}
- Days Remaining: ${campaignDaysLeft}
- Current Donors: ${campaignDonorCount}
- Average Gift: ${campaignAverageGift}
- Target Audience: ${campaign.targetAudience || 'General supporters'}
- Campaign Focus: ${campaignDescription}

Create a comprehensive plan including:
1. **Week-by-week timeline** for the remaining ${campaignDaysLeft} days
2. **Donor acquisition strategy** (need ${Math.ceil((campaignGoal - campaignRaised) / campaignAverageGift)} more donors at current avg)
3. **Daily fundraising targets** (need ${Math.ceil((campaignGoal - campaignRaised) / campaignDaysLeft)}/day)
4. **Outreach tactics** specific to ${campaign.category.toLowerCase()} campaigns
5. **Content calendar** with email and social media themes
6. **Performance metrics** to track and optimize
7. **Contingency plans** if we fall behind schedule

Focus on strategies appropriate for ${campaign.category} campaigns targeting ${campaign.targetAudience || 'your audience'}.`;

    case 'social':
      return `Write engaging social media content for this ${campaign.category.toLowerCase()} campaign:

Campaign: ${campaignName}
Progress: ${campaignProgress}% of ${campaignGoal.toLocaleString()} goal  
Days Left: ${campaignDaysLeft}
Category: ${campaign.category}
Current Donors: ${campaignDonorCount}
Focus: ${campaignDescription}

Create posts for:
1. **Facebook post** (engaging, shareable, appropriate for ${campaign.category})
2. **Twitter/X post** (concise, under 280 characters)
3. **Instagram caption** (visual storytelling, with relevant hashtags)
4. **LinkedIn post** (professional tone, especially if B2B relevant)

Make them campaign-specific, category-appropriate, and include clear calls-to-action. Consider the urgency of ${campaignDaysLeft} days remaining.`;

    case 'custom':
      return `Help me with this ${campaign.category.toLowerCase()} campaign:

Campaign: ${campaignName}
Status: ${campaign.status}
Goal: ${campaignGoal.toLocaleString()}  
Progress: ${campaignProgress}% complete (${campaignDaysLeft} days left)
Current Performance: ${campaignDonorCount} donors, ${campaignAverageGift} avg gift
Focus: ${campaignDescription}

Please provide specific, actionable advice for this fundraising campaign.`;

    default:
      return `Help me with this ${campaign.category.toLowerCase()} campaign: 

Campaign: ${campaignName}
Goal: ${campaignGoal.toLocaleString()}  
Progress: ${campaignProgress}% complete (${campaignDaysLeft} days left)
Focus: ${campaignDescription}

Please provide specific, actionable advice for this fundraising campaign.`;
  }
};

// Helper function to calculate days left
function calculateDaysLeft(endDate: string): number {
  if (!endDate) return 0;
  
  try {
    const deadline = new Date(endDate);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
}
