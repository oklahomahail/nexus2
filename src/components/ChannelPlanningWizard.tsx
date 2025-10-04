// src/components/ChannelPlanningWizard.tsx

import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Zap,
  Mail,
  Share2,
  Clock,
  Plus,
  Minus,
  Copy,
  Eye,
  Play,
  Save,
  X,
  AlertCircle,
  Info,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";

import type {
  MultiChannelCampaign,
  ChannelType,
  AutomationRule,
  SocialPlatform,
  WorkflowAction,
} from "@/models/channels";
import { PLATFORM_CONFIGS } from "@/services/socialMediaService";

interface ChannelPlanningWizardProps {
  campaignId: string;
  clientId: string;
  onComplete?: (multiChannelCampaign: MultiChannelCampaign) => void;
  onCancel?: () => void;
}

type WizardStep =
  | "overview"
  | "channels"
  | "content"
  | "audience"
  | "scheduling"
  | "automation"
  | "review";

type ChannelConfig = {
  type: ChannelType;
  enabled: boolean;
  priority: number;
  config: any;
};

export const ChannelPlanningWizard: React.FC<ChannelPlanningWizardProps> = ({
  campaignId: _campaignId,
  clientId: _clientId,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("overview");
  const [isLoading, setIsLoading] = useState(false);

  // Campaign data state
  const [campaignData, setCampaignData] = useState<
    Partial<MultiChannelCampaign>
  >({
    channels: {},
    sequence: [],
    frequency: {
      maxContactsPerDay: 3,
      maxContactsPerWeek: 10,
      minHoursBetweenContacts: 4,
      preferredContactTimes: {
        start: "09:00",
        end: "17:00",
        timezone: "America/New_York",
      },
    },
    status: "draft",
  });

  // Channel configurations
  const [channelConfigs, setChannelConfigs] = useState<ChannelConfig[]>([
    {
      type: "email",
      enabled: true,
      priority: 1,
      config: {
        subject: "",
        content: "",
        segmentIds: [],
        sendDelay: 0, // minutes after campaign start
      },
    },
    {
      type: "social_media",
      enabled: false,
      priority: 2,
      config: {
        platforms: ["facebook"] as SocialPlatform[],
        message: "",
        hashtags: [],
        sendDelay: 30, // 30 minutes after email
      },
    },
    {
      type: "direct_mail",
      enabled: false,
      priority: 3,
      config: {
        mailType: "postcard",
        content: "",
        sendDelay: 1440, // 24 hours after email
      },
    },
  ]);

  // Automation rules
  const [automationRules, setAutomationRules] = useState<
    Partial<AutomationRule>[]
  >([
    {
      name: "Follow-up for Non-Openers",
      trigger: {
        type: "engagement_based",
        conditions: [
          {
            field: "email_opened",
            operator: "equals",
            value: false,
          },
        ],
      },
      actions: [
        {
          type: "wait",
          delay: 2880, // 48 hours
        },
        {
          type: "send_email",
          parameters: {
            templateId: "follow_up_template",
          },
        },
      ],
      isActive: true,
    },
  ]);

  const steps: Array<{ key: WizardStep; label: string; description: string }> =
    [
      {
        key: "overview",
        label: "Overview",
        description: "Campaign goals and strategy",
      },
      {
        key: "channels",
        label: "Channels",
        description: "Select communication channels",
      },
      {
        key: "content",
        label: "Content",
        description: "Create channel content",
      },
      {
        key: "audience",
        label: "Audience",
        description: "Target audience and segments",
      },
      {
        key: "scheduling",
        label: "Scheduling",
        description: "Timeline and sequence",
      },
      {
        key: "automation",
        label: "Automation",
        description: "Setup automation rules",
      },
      { key: "review", label: "Review", description: "Review and launch" },
    ];

  const getCurrentStepIndex = () =>
    steps.findIndex((step) => step.key === currentStep);

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      // Build the multi-channel campaign
      const multiChannelCampaign: MultiChannelCampaign = {
        id: `multi_${Date.now()}`,
        name: campaignData.name || "Multi-Channel Campaign",
        description: campaignData.description || "Multi-channel campaign",
        type: "multichannel",
        status: "scheduled",
        createdAt: new Date(),
        updatedAt: new Date(),
        launchDate: new Date(),
        endDate: campaignData.endDate,
        startDate: campaignData.startDate,
        frequency: campaignData.frequency,
        content: campaignData.content,
        budget: {
          total: 0,
          allocated: {},
          spent: {},
        },
        audience: {
          totalSize: 0,
          segments: [],
          channelDistribution: {},
          totalRecipients: 0,
        },
        channels: {},
        sequence: buildChannelSequence(),
        performance: {
          totalSent: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0,
          totalConverted: 0,
          totalRevenue: 0,
          channelBreakdown: {},
        },
        settings: {
          coordinateDelivery: true,
          respectFrequencyCaps: true,
          enableCrosschannelOptimization: true,
        },
      };

      onComplete?.(multiChannelCampaign);
    } catch (error) {
      console.error("Error completing channel planning:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildChannelSequence = (): WorkflowAction[] => {
    return channelConfigs
      .filter((config) => config.enabled)
      .sort((a, b) => a.priority - b.priority)
      .map((config) => ({
        id: `${config.type}_${Date.now()}`,
        type: "send_email" as const, // Simplified for now
        delay: config.config.sendDelay || 0,
        parameters: {
          channelType: config.type,
          config: config.config,
        },
      }));
  };

  const updateChannelConfig = (
    type: ChannelType,
    updates: Partial<ChannelConfig>,
  ) => {
    setChannelConfigs((configs) =>
      configs.map((config) =>
        config.type === type ? { ...config, ...updates } : config,
      ),
    );
  };

  const addAutomationRule = () => {
    setAutomationRules((rules) => [
      ...rules,
      {
        name: "New Automation Rule",
        trigger: {
          type: "time_based",
          conditions: [],
        },
        actions: [],
        isActive: true,
      },
    ]);
  };

  const removeAutomationRule = (index: number) => {
    setAutomationRules((rules) => rules.filter((_, i) => i !== index));
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = getCurrentStepIndex() > index;

        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              <div className="ml-3 text-left">
                <div
                  className={`text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-900"}`}
                >
                  {step.label}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-6 w-16 h-px ${isCompleted ? "bg-green-600" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderOverviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Campaign Overview</h3>
        <p className="text-gray-600 mb-6">
          Define the goals and strategy for your multi-channel campaign.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            value={campaignData.name || ""}
            onChange={(e) =>
              setCampaignData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Multi-Channel Fundraising Campaign"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Duration
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={
                campaignData.startDate
                  ? campaignData.startDate.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setCampaignData((prev) => ({
                  ...prev,
                  startDate: new Date(e.target.value),
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={
                campaignData.endDate
                  ? campaignData.endDate.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setCampaignData((prev) => ({
                  ...prev,
                  endDate: new Date(e.target.value),
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={campaignData.description || ""}
            onChange={(e) =>
              setCampaignData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Describe your campaign goals and strategy..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Multi-Channel Strategy Tips
            </h4>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Start with email as your primary channel</li>
              <li>• Use social media for broader awareness and engagement</li>
              <li>• Consider direct mail for high-value donor segments</li>
              <li>• Plan 24-48 hours between major touchpoints</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChannelsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Select Communication Channels
        </h3>
        <p className="text-gray-600 mb-6">
          Choose which channels to include in your campaign and set their
          priority order.
        </p>
      </div>

      <div className="space-y-4">
        {channelConfigs.map((config) => (
          <div
            key={config.type}
            className={`border-2 rounded-lg p-4 transition-all ${
              config.enabled ? "border-blue-500 bg-blue-50" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) =>
                    updateChannelConfig(config.type, {
                      enabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600"
                />
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">
                    {config.type === "email"
                      ? "📧"
                      : config.type === "social_media"
                        ? "📱"
                        : config.type === "direct_mail"
                          ? "📮"
                          : "📊"}
                  </div>
                  <div>
                    <h4 className="font-medium capitalize">
                      {config.type.replace("_", " ")}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Priority: #{config.priority}
                    </p>
                  </div>
                </div>
              </div>

              {config.enabled && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateChannelConfig(config.type, {
                        priority: Math.max(1, config.priority - 1),
                      })
                    }
                    disabled={config.priority <= 1}
                    className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium">{config.priority}</span>
                  <button
                    onClick={() =>
                      updateChannelConfig(config.type, {
                        priority: config.priority + 1,
                      })
                    }
                    className="p-1 text-gray-600 hover:text-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {config.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send Delay (minutes after previous channel)
                  </label>
                  <input
                    type="number"
                    value={config.config.sendDelay || 0}
                    onChange={(e) =>
                      updateChannelConfig(config.type, {
                        config: {
                          ...config.config,
                          sendDelay: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    min="0"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">minutes</span>
                </div>

                {/* Channel-specific configuration */}
                {config.type === "social_media" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platforms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(PLATFORM_CONFIGS).map(
                        ([platform, platformConfig]) => (
                          <label
                            key={platform}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={config.config.platforms?.includes(
                                platform,
                              )}
                              onChange={(e) => {
                                const platforms = config.config.platforms || [];
                                const updatedPlatforms = e.target.checked
                                  ? [...platforms, platform]
                                  : platforms.filter(
                                      (p: string) => p !== platform,
                                    );

                                updateChannelConfig(config.type, {
                                  config: {
                                    ...config.config,
                                    platforms: updatedPlatforms,
                                  },
                                });
                              }}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm">
                              {platformConfig.name}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {config.type === "direct_mail" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mail Type
                    </label>
                    <select
                      value={config.config.mailType || "postcard"}
                      onChange={(e) =>
                        updateChannelConfig(config.type, {
                          config: {
                            ...config.config,
                            mailType: e.target.value,
                          },
                        })
                      }
                      className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="postcard">Postcard</option>
                      <option value="letter">Letter</option>
                      <option value="brochure">Brochure</option>
                      <option value="catalog">Catalog</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">
              Channel Sequencing Tips
            </h4>
            <ul className="mt-2 text-sm text-yellow-800 space-y-1">
              <li>• Email typically performs best as the first touchpoint</li>
              <li>• Social media works well 30-60 minutes after email</li>
              <li>
                • Direct mail should be scheduled 24-48 hours later for maximum
                impact
              </li>
              <li>• Lower priority numbers send first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Content for Each Channel</h3>
        <p className="text-gray-600 mb-6">
          Create or configure content for each selected channel.
        </p>
      </div>

      <div className="space-y-6">
        {channelConfigs
          .filter((config) => config.enabled)
          .map((config) => (
            <div
              key={config.type}
              className="border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-2xl">
                  {config.type === "email"
                    ? "📧"
                    : config.type === "social_media"
                      ? "📱"
                      : config.type === "direct_mail"
                        ? "📮"
                        : "📊"}
                </div>
                <h4 className="text-lg font-medium capitalize">
                  {config.type.replace("_", " ")} Content
                </h4>
              </div>

              {config.type === "email" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={config.config.subject || ""}
                      onChange={(e) =>
                        updateChannelConfig(config.type, {
                          config: { ...config.config, subject: e.target.value },
                        })
                      }
                      placeholder="Your compelling email subject..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Content
                    </label>
                    <textarea
                      value={config.config.content || ""}
                      onChange={(e) =>
                        updateChannelConfig(config.type, {
                          config: { ...config.config, content: e.target.value },
                        })
                      }
                      placeholder="Your email message content..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {config.type === "social_media" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Social Media Message
                    </label>
                    <textarea
                      value={config.config.message || ""}
                      onChange={(e) =>
                        updateChannelConfig(config.type, {
                          config: { ...config.config, message: e.target.value },
                        })
                      }
                      placeholder="Your social media post content..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hashtags
                    </label>
                    <input
                      type="text"
                      value={config.config.hashtags?.join(" ") || ""}
                      onChange={(e) =>
                        updateChannelConfig(config.type, {
                          config: {
                            ...config.config,
                            hashtags: e.target.value
                              .split(" ")
                              .filter((tag) => tag.length > 0),
                          },
                        })
                      }
                      placeholder="#nonprofit #fundraising #community"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {config.type === "direct_mail" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mail Content
                    </label>
                    <textarea
                      value={config.config.content || ""}
                      onChange={(e) =>
                        updateChannelConfig(config.type, {
                          config: { ...config.config, content: e.target.value },
                        })
                      }
                      placeholder="Your direct mail message content..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center space-x-2 text-sm text-blue-600">
                <Eye className="w-4 h-4" />
                <button className="hover:text-blue-800">Preview Content</button>
                <span className="text-gray-300">|</span>
                <Copy className="w-4 h-4" />
                <button className="hover:text-blue-800">Use Template</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderAudienceStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Target Audience & Segments
        </h3>
        <p className="text-gray-600 mb-6">
          Define who will receive your multi-channel campaign.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">Primary Segments</h4>
          {[
            {
              id: "seg_1",
              name: "Major Donors",
              count: 150,
              description: "Donors who gave $1000+ last year",
            },
            {
              id: "seg_2",
              name: "Monthly Donors",
              count: 500,
              description: "Recurring monthly contributors",
            },
            {
              id: "seg_3",
              name: "Lapsed Donors",
              count: 1200,
              description: "Haven't donated in 12+ months",
            },
            {
              id: "seg_4",
              name: "Newsletter Subscribers",
              count: 3500,
              description: "Email subscribers, no donations yet",
            },
          ].map((segment) => (
            <label
              key={segment.id}
              className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <input type="checkbox" className="w-4 h-4 text-blue-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{segment.name}</span>
                  <span className="text-sm text-gray-600">
                    {segment.count.toLocaleString()} people
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {segment.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Frequency Settings</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Contacts per Day
            </label>
            <input
              type="number"
              value={campaignData.frequency?.maxContactsPerDay || 3}
              onChange={(e) =>
                setCampaignData((prev) => ({
                  ...prev,
                  frequency: {
                    ...prev.frequency!,
                    maxContactsPerDay: parseInt(e.target.value) || 3,
                  },
                }))
              }
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Contacts per Week
            </label>
            <input
              type="number"
              value={campaignData.frequency?.maxContactsPerWeek || 10}
              onChange={(e) =>
                setCampaignData((prev) => ({
                  ...prev,
                  frequency: {
                    ...prev.frequency!,
                    maxContactsPerWeek: parseInt(e.target.value) || 10,
                  },
                }))
              }
              min="1"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Hours Between Contacts
            </label>
            <input
              type="number"
              value={campaignData.frequency?.minHoursBetweenContacts || 4}
              onChange={(e) =>
                setCampaignData((prev) => ({
                  ...prev,
                  frequency: {
                    ...prev.frequency!,
                    minHoursBetweenContacts: parseInt(e.target.value) || 4,
                  },
                }))
              }
              min="1"
              max="72"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Start Time
              </label>
              <input
                type="time"
                value={
                  campaignData.frequency?.preferredContactTimes?.start ||
                  "09:00"
                }
                onChange={(e) =>
                  setCampaignData((prev) => ({
                    ...prev,
                    frequency: {
                      ...prev.frequency!,
                      preferredContactTimes: {
                        ...prev.frequency?.preferredContactTimes!,
                        start: e.target.value,
                      },
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred End Time
              </label>
              <input
                type="time"
                value={
                  campaignData.frequency?.preferredContactTimes?.end || "17:00"
                }
                onChange={(e) =>
                  setCampaignData((prev) => ({
                    ...prev,
                    frequency: {
                      ...prev.frequency!,
                      preferredContactTimes: {
                        ...prev.frequency?.preferredContactTimes!,
                        end: e.target.value,
                      },
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchedulingStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Campaign Timeline & Sequence
        </h3>
        <p className="text-gray-600 mb-6">
          Review and adjust the timing of your multi-channel sequence.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium mb-4">Channel Sequence Timeline</h4>

        <div className="space-y-4">
          {channelConfigs
            .filter((config) => config.enabled)
            .sort((a, b) => a.priority - b.priority)
            .map((config, index) => {
              const totalDelay = channelConfigs
                .filter((c) => c.enabled && c.priority <= config.priority)
                .reduce((sum, c) => sum + (c.config.sendDelay || 0), 0);

              const delayHours = Math.floor(totalDelay / 60);
              const delayMinutes = totalDelay % 60;

              return (
                <div
                  key={config.type}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                        index === 0 ? "bg-green-600" : "bg-blue-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="text-2xl">
                      {config.type === "email"
                        ? "📧"
                        : config.type === "social_media"
                          ? "📱"
                          : config.type === "direct_mail"
                            ? "📮"
                            : "📊"}
                    </div>
                    <div>
                      <h5 className="font-medium capitalize">
                        {config.type.replace("_", " ")}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {index === 0
                          ? "Campaign Start"
                          : `${delayHours > 0 ? `${delayHours}h ` : ""}${delayMinutes}m after start`}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-sm text-gray-600">
                      {config.type === "email" && config.config.subject}
                      {config.type === "social_media" &&
                        (config.config.platforms?.join(", ") || "Social Media")}
                      {config.type === "direct_mail" && config.config.mailType}
                    </div>
                  </div>

                  <div className="text-right">
                    <input
                      type="number"
                      value={config.config.sendDelay || 0}
                      onChange={(e) =>
                        updateChannelConfig(config.type, {
                          config: {
                            ...config.config,
                            sendDelay: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      min="0"
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={index === 0}
                    />
                    <div className="text-xs text-gray-500 mt-1">minutes</div>
                  </div>

                  {index <
                    channelConfigs.filter((c) => c.enabled).length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Timeline Best Practices
            </h4>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Email opens peak 2-4 hours after sending</li>
              <li>
                • Social media engagement is highest 30-60 minutes after email
              </li>
              <li>• Allow 24-48 hours for direct mail processing and impact</li>
              <li>• Avoid weekends for professional/corporate audiences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAutomationStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Automation Rules</h3>
        <p className="text-gray-600 mb-6">
          Set up automated follow-up actions based on donor behavior.
        </p>
      </div>

      <div className="space-y-6">
        {automationRules.map((rule, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <input
                  type="text"
                  value={rule.name || ""}
                  onChange={(e) => {
                    const updatedRules = [...automationRules];
                    updatedRules[index] = { ...rule, name: e.target.value };
                    setAutomationRules(updatedRules);
                  }}
                  className="text-lg font-medium bg-transparent border-none focus:outline-none"
                  placeholder="Automation Rule Name"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={(e) => {
                      const updatedRules = [...automationRules];
                      updatedRules[index] = {
                        ...rule,
                        isActive: e.target.checked,
                      };
                      setAutomationRules(updatedRules);
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-600">Active</span>
                </label>
                <button
                  onClick={() => removeAutomationRule(index)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-3">When (Trigger)</h5>
                <div className="space-y-3">
                  <select
                    value={rule.trigger?.type || "engagement_based"}
                    onChange={(e) => {
                      const updatedRules = [...automationRules];
                      updatedRules[index] = {
                        ...rule,
                        trigger: {
                          ...rule.trigger!,
                          type: e.target.value as any,
                        },
                      };
                      setAutomationRules(updatedRules);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="engagement_based">Engagement Based</option>
                    <option value="time_based">Time Based</option>
                    <option value="behavior_based">Behavior Based</option>
                    <option value="data_based">Data Based</option>
                  </select>

                  {rule.trigger?.type === "engagement_based" && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <p>
                        Triggers when donor doesn't open email within 48 hours
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Then (Actions)</h5>
                <div className="space-y-2">
                  {rule.actions?.map((action, actionIndex) => (
                    <div
                      key={actionIndex}
                      className="flex items-center space-x-2 text-sm bg-gray-50 p-2 rounded"
                    >
                      {action.type === "wait" && (
                        <>
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span>Wait {action.delay} minutes</span>
                        </>
                      )}
                      {action.type === "send_email" && (
                        <>
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span>Send follow-up email</span>
                        </>
                      )}
                      {action.type === "post_social" && (
                        <>
                          <Share2 className="w-4 h-4 text-purple-600" />
                          <span>Post to social media</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addAutomationRule}
          className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-5 h-5" />
          <span>Add Automation Rule</span>
        </button>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-green-900">
              Automation Best Practices
            </h4>
            <ul className="mt-2 text-sm text-green-800 space-y-1">
              <li>• Follow up with non-openers within 48-72 hours</li>
              <li>• Send thank you messages immediately after donations</li>
              <li>• Create different paths for different donor segments</li>
              <li>• Always include an easy way to opt out</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const enabledChannels = channelConfigs.filter((config) => config.enabled);
    const estimatedReach = enabledChannels.reduce((sum, config) => {
      // Mock calculation based on channel type
      const baseReach =
        config.type === "email"
          ? 1000
          : config.type === "social_media"
            ? 2000
            : config.type === "direct_mail"
              ? 500
              : 0;
      return sum + baseReach;
    }, 0);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Review & Launch Campaign
          </h3>
          <p className="text-gray-600 mb-6">
            Review your multi-channel campaign before launching.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Summary */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium mb-4">Campaign Summary</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Name:</dt>
                  <dd className="font-medium">{campaignData.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Channels:</dt>
                  <dd className="font-medium">{enabledChannels.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Est. Reach:</dt>
                  <dd className="font-medium">
                    {estimatedReach.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Duration:</dt>
                  <dd className="font-medium">
                    {campaignData.startDate && campaignData.endDate
                      ? `${Math.ceil((campaignData.endDate.getTime() - campaignData.startDate.getTime()) / (1000 * 60 * 60 * 24))} days`
                      : "Not set"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Automation Rules:</dt>
                  <dd className="font-medium">
                    {automationRules.filter((rule) => rule.isActive).length}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium mb-4">Channel Sequence</h4>
              <div className="space-y-2">
                {enabledChannels
                  .sort((a, b) => a.priority - b.priority)
                  .map((config, _index) => (
                    <div
                      key={config.type}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <div className="text-lg">
                        {config.type === "email"
                          ? "📧"
                          : config.type === "social_media"
                            ? "📱"
                            : config.type === "direct_mail"
                              ? "📮"
                              : "📊"}
                      </div>
                      <span className="font-medium">{_index + 1}.</span>
                      <span className="capitalize">
                        {config.type.replace("_", " ")}
                      </span>
                      {_index > 0 && (
                        <span className="text-gray-600">
                          (+{config.config.sendDelay}m)
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Pre-Launch Checklist */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium mb-4">Pre-Launch Checklist</h4>
              <div className="space-y-3">
                {[
                  {
                    item: "Campaign name and description set",
                    checked: !!campaignData.name,
                  },
                  {
                    item: "At least one channel selected",
                    checked: enabledChannels.length > 0,
                  },
                  {
                    item: "Content created for all channels",
                    checked: enabledChannels.every(
                      (c) =>
                        c.config.content ||
                        c.config.subject ||
                        c.config.message,
                    ),
                  },
                  { item: "Target audience defined", checked: true },
                  { item: "Timeline and sequence configured", checked: true },
                  {
                    item: "Automation rules set up",
                    checked: automationRules.some((rule) => rule.isActive),
                  },
                ].map((checkItem, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {checkItem.checked ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    <span
                      className={`text-sm ${checkItem.checked ? "text-gray-900" : "text-yellow-800"}`}
                    >
                      {checkItem.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Expected Results
                  </h4>
                  <ul className="mt-2 text-sm text-blue-800 space-y-1">
                    <li>
                      • Est. {Math.floor(estimatedReach * 0.25)} people reached
                      across all channels
                    </li>
                    <li>
                      • Expected {Math.floor(estimatedReach * 0.02)} conversions
                    </li>
                    <li>
                      • Projected ${Math.floor(estimatedReach * 0.02 * 75)} in
                      revenue
                    </li>
                    <li>
                      • {automationRules.filter((r) => r.isActive).length}{" "}
                      automation workflows active
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Multi-Channel Campaign Planner
            </h2>
            <p className="text-gray-600 mt-1">
              Plan and coordinate campaigns across multiple communication
              channels
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {renderStepIndicator()}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        {currentStep === "overview" && renderOverviewStep()}
        {currentStep === "channels" && renderChannelsStep()}
        {currentStep === "content" && renderContentStep()}
        {currentStep === "audience" && renderAudienceStep()}
        {currentStep === "scheduling" && renderSchedulingStep()}
        {currentStep === "automation" && renderAutomationStep()}
        {currentStep === "review" && renderReviewStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={getCurrentStepIndex() === 0}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          {getCurrentStepIndex() === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              <span>{isLoading ? "Launching..." : "Launch Campaign"}</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
