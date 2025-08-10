/* eslint-disable */
import { useState, useCallback, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  Copy,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Target,
  TrendingUp,
  // Users,
  Zap,
  CheckCircle,
} from "lucide-react";

interface ClaudePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentCampaign?: any;
  onCampaignSelect?: (campaign: any) => void;
}

interface ClaudeAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
}

const ClaudePanel: React.FC<ClaudePanelProps> = ({
  isOpen,
  onClose,
  currentCampaign,
}) => {
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const claudeActions: ClaudeAction[] = [
    {
      id: "email",
      label: "Email Campaign",
      description: "Generate compelling donation request emails",
      icon: MessageSquare,
      prompt: "Create a persuasive donation email for our campaign",
    },
    {
      id: "social",
      label: "Social Media",
      description: "Create engaging social media posts",
      icon: Sparkles,
      prompt: "Write social media posts to promote our fundraising campaign",
    },
    {
      id: "strategy",
      label: "Campaign Strategy",
      description: "Get strategic advice for campaign optimization",
      icon: Target,
      prompt:
        "Provide strategic recommendations to improve our campaign performance",
    },
    {
      id: "analytics",
      label: "Performance Analysis",
      description: "Analyze campaign metrics and suggest improvements",
      icon: TrendingUp,
      prompt:
        "Analyze our campaign performance and suggest actionable improvements",
    },
  ];

  const handleGenerate = useCallback(
    async (actionType: string) => {
      if (!currentCampaign) return;

      setIsLoading(true);
      setSelectedAction(actionType);

      try {
        // Simulate AI response
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockResponses = {
          email: `Subject: Join Us in Making a Difference - ${currentCampaign.name}

Dear [Donor Name],

I hope this message finds you well. As we approach the final weeks of our ${currentCampaign.name}, I wanted to reach out personally to share the incredible impact we've made together.

So far, we've raised $${currentCampaign.raised?.toLocaleString()} toward our goal of $${currentCampaign.goal?.toLocaleString()}, and with ${currentCampaign.daysLeft} days remaining, every contribution brings us closer to creating lasting change in our community.

Your support has already helped us:
• Reach ${currentCampaign.donorCount} dedicated supporters
• Achieve ${Math.round((currentCampaign.raised / currentCampaign.goal) * 100)}% of our fundraising goal
• Create meaningful impact for those we serve

With your continued partnership, we can reach our full potential and make an even greater difference. Would you consider making a contribution today?

[DONATE NOW BUTTON]

Thank you for believing in our mission.

Warm regards,
Dave Hail`,

          social: `🌟 Amazing news! Our ${currentCampaign.name} is ${Math.round((currentCampaign.raised / currentCampaign.goal) * 100)}% funded!

💝 Thanks to ${currentCampaign.donorCount} incredible supporters, we've raised $${currentCampaign.raised?.toLocaleString()} toward our $${currentCampaign.goal?.toLocaleString()} goal.

⏰ Only ${currentCampaign.daysLeft} days left to make a difference!

Every dollar counts. Join our mission: [LINK]

#Nonprofit #Fundraising #CommunityImpact #MakeADifference`,

          strategy: `Campaign Optimization Recommendations for ${currentCampaign.name}:

🎯 PRIORITY ACTIONS:
1. Increase donation frequency with ${currentCampaign.donorCount} existing donors
2. Launch peer-to-peer fundraising campaign
3. Create urgency messaging with ${currentCampaign.daysLeft} days remaining

📊 PERFORMANCE INSIGHTS:
• Current conversion rate: ${currentCampaign.conversionRate}%
• Average gift size: $${currentCampaign.averageGift}
• Email engagement: ${currentCampaign.clickThroughRate}% CTR

🚀 GROWTH OPPORTUNITIES:
• Target lapsed donors with reactivation campaign
• Implement matching gift challenge
• Leverage social media influencers
• Create compelling impact stories

💡 NEXT STEPS:
Focus on the final push with urgent, impact-focused messaging that highlights the ${Math.round((currentCampaign.raised / currentCampaign.goal) * 100)}% progress made.`,

          analytics: `Performance Analysis for ${currentCampaign.name}:

📈 STRONG METRICS:
✅ Donor engagement: ${currentCampaign.donorCount} supporters (Above average)
✅ Conversion rate: ${currentCampaign.conversionRate}% (Industry benchmark: 2-5%)
✅ Email performance: ${currentCampaign.clickThroughRate}% CTR (Good engagement)

⚠️ AREAS FOR IMPROVEMENT:
• Average gift size: $${currentCampaign.averageGift} (Could increase by 15-20%)
• Time remaining: ${currentCampaign.daysLeft} days (Need acceleration)
• Progress: ${Math.round((currentCampaign.raised / currentCampaign.goal) * 100)}% (Needs final push)

🎯 RECOMMENDED ACTIONS:
1. Launch a matching gift campaign to double impact
2. Create urgency with countdown messaging
3. Segment donors for personalized asks
4. Share impact stories to increase emotional connection

Expected outcome: 25-30% increase in final weeks with focused effort.`,
        };

        setResponse(
          mockResponses[actionType as keyof typeof mockResponses] ||
            "Response generated successfully!",
        );
      } catch (error) {
        setResponse("Sorry, I encountered an error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [currentCampaign],
  );

  const handleCustomGenerate = useCallback(async () => {
    if (!customPrompt.trim()) return;

    setIsLoading(true);
    setSelectedAction("custom");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResponse(`Based on your request: "${customPrompt}"

I'd be happy to help with that! For your ${currentCampaign?.name || "campaign"}, here's what I recommend:

This is a custom response based on your specific request. The AI assistant would provide tailored advice, content, or analysis based on your exact needs and current campaign data.

Would you like me to elaborate on any specific aspect or generate additional content?`);
    } catch (error) {
      setResponse("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [customPrompt, currentCampaign]);

  const handleCopy = useCallback(async () => {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(response);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [response]);

  const handleNewRequest = useCallback(() => {
    setResponse("");
    setSelectedAction("");
    setCustomPrompt("");
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl z-50 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600/20 rounded-xl">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  AI Assistant
                </h2>
                <p className="text-sm text-slate-400">
                  Powered by Claude • Campaign optimization & content generation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Campaign Info */}
          {currentCampaign && (
            <div className="p-6 bg-slate-800/30 border-b border-slate-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    {currentCampaign.name}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="text-slate-300">
                      <strong>
                        ${currentCampaign.raised?.toLocaleString()}
                      </strong>{" "}
                      raised
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300">
                      <strong>
                        {Math.round(
                          (currentCampaign.raised / currentCampaign.goal) * 100,
                        )}
                        %
                      </strong>{" "}
                      complete
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300">
                      <strong>{currentCampaign.daysLeft}</strong> days left
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    ${currentCampaign.goal?.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">Goal</div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {!response && !isLoading && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                    Quick Actions
                  </h3>
                  {currentCampaign && (
                    <div className="grid grid-cols-1 gap-3">
                      {claudeActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.id}
                            onClick={() => handleGenerate(action.id)}
                            disabled={isLoading}
                            className="p-4 text-left border border-slate-700/50 rounded-xl hover:border-purple-500/50 hover:bg-slate-800/50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-purple-600/20 transition-colors">
                                <Icon className="w-5 h-5 text-slate-400 group-hover:text-purple-400" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-white group-hover:text-purple-300 transition-colors">
                                  {action.label}
                                </div>
                                <div className="text-sm text-slate-400 mt-1">
                                  {action.description}
                                </div>
                              </div>
                              <Zap className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Custom Prompt */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                    Custom Request
                  </h3>
                  <div className="space-y-3">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ask Claude anything about your campaign, request content creation, or get strategic advice..."
                      className="w-full h-24 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none transition-all"
                    />
                    <button
                      onClick={handleCustomGenerate}
                      disabled={isLoading || !customPrompt.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {isLoading ? "Generating..." : "Send to Claude"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-6 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
                  <Bot className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">
                    Claude is thinking...
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    {selectedAction &&
                      `Generating ${claudeActions.find((a) => a.id === selectedAction)?.label.toLowerCase()}`}
                  </p>
                </div>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                    Claude's Response
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopy}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        copySuccess
                          ? "bg-green-600/20 text-green-400 border border-green-500/30"
                          : "bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50 border border-slate-700/50"
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copySuccess ? "Copied!" : "Copy"}</span>
                    </button>
                    <button
                      onClick={handleNewRequest}
                      className="px-3 py-2 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 border border-slate-700/50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>New Request</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
                  <pre className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-mono">
                    {response}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClaudePanel;
