export const getClaudePrompt = (type: any, campaign: { name: any; goal: { toLocaleString: () => any; }; deadline: any; description: any; raised: { toLocaleString: () => any; }; progress: any; engagement: any; responseRate: any; daysLeft: any; contactCount: any; }) => {
  if (!campaign) return 'Help me with a fundraising campaign.';

  switch (type) {
    case 'subject':
      return `Write 3 emotionally compelling subject lines for this fundraising campaign:

Name: ${campaign.name}
Goal: ${campaign.goal?.toLocaleString()}
Deadline: ${campaign.deadline}
Focus: ${campaign.description}

Make them urgent, personal, and action-oriented.`;

    case 'email':
      return `Draft a donor email for the campaign "${campaign.name}". Include:
- A warm greeting
- A story or reason to care
- An urgent but kind ask
- A clear call to action

Details:
Goal: $${campaign.goal?.toLocaleString()}
Raised: $${campaign.raised?.toLocaleString()}
Progress: ${campaign.progress}%
Deadline: ${campaign.deadline}
Summary: ${campaign.description}`;

    case 'cta':
      return `Suggest 5 CTA buttons for this campaign:
Name: ${campaign.name}
Goal: $${campaign.goal?.toLocaleString()}
Focus: ${campaign.description}

Make them short, urgent, and inspiring.`;

    case 'feedback':
      return `Give 3 improvements for this campaign:
Name: ${campaign.name}
Goal: $${campaign.goal?.toLocaleString()}
Progress: ${campaign.progress}%
Deadline: ${campaign.deadline}
Engagement: ${campaign.engagement}
Response Rate: ${campaign.responseRate}%
Focus: ${campaign.description}`;

    case 'strategy':
      return `Build a 2-week plan to finish this campaign:
Name: ${campaign.name}
Goal: $${campaign.goal?.toLocaleString()}
Progress: ${campaign.progress}%
Days Left: ${campaign.daysLeft}
Contact Count: ${campaign.contactCount}
Description: ${campaign.description}

Include outreach ideas, segmentation, and timing.`;

    default:
      return `Help me with this campaign: ${campaign.name}`;
  }
};
