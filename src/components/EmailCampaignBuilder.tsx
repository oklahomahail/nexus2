// src/components/EmailCampaignBuilder.tsx

import {
  Mail,
  Send,
  Users,
  Settings,
  Plus,
  Image,
  Type,
  Link,
  Divide,
  Share2,
  Copy,
  Trash2,
  Calendar,
  TestTube,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

import type {
  EmailCampaign,
  CreateEmailCampaignData,
  ChannelTemplate,
} from "@/models/channels";
import {
  createEmailCampaign,
  updateEmailCampaign,
  getEmailSegments,
  EmailTemplateEngine,
  sendEmailCampaign,
  scheduleEmailCampaign,
  type EmailComponent as EmailComponentType,
} from "@/services/emailCampaignService";

interface EmailCampaignBuilderProps {
  campaignId: string;
  clientId: string;
  existingEmail?: EmailCampaign | null;
  onSave?: (emailCampaign: EmailCampaign) => void;
  onClose?: () => void;
}

type BuilderStep =
  | "setup"
  | "design"
  | "content"
  | "audience"
  | "schedule"
  | "review";

export const EmailCampaignBuilder: React.FC<EmailCampaignBuilderProps> = ({
  campaignId,
  clientId,
  existingEmail,
  onSave,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>("setup");
  const [emailData, setEmailData] = useState<Partial<EmailCampaign>>({
    campaignId,
    clientId,
    type: "email",
    sendType: "immediate",
    status: "draft",
    segmentIds: [],
  });
  const [templates, setTemplates] = useState<ChannelTemplate[]>([]);
  const [segments, setSegments] = useState<
    Array<{ id: string; name: string; count: number }>
  >([]);
  const [emailComponents, setEmailComponents] = useState<EmailComponentType[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(false);

  useEffect(() => {
    void loadSegments();
    // loadSegments(); // Duplicate call removed
    if (existingEmail) {
      setEmailData(existingEmail);
    }
  }, [existingEmail, clientId, loadSegments]);

  const _loadTemplates = () => {
    const availableTemplates = EmailTemplateEngine.getAllTemplates();
    setTemplates(availableTemplates);
  };

  const loadSegments = useCallback(async () => {
    try {
      const availableSegments = await getEmailSegments(clientId);
      setSegments(availableSegments);
    } catch (error) {
      console.error("Error loading segments:", error);
    }
  }, [clientId]);

  const handleSave = async () => {
    if (!emailData.name || !emailData.subject || !emailData.htmlContent) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      let savedCampaign: EmailCampaign;

      if (existingEmail) {
        savedCampaign = (await updateEmailCampaign(
          existingEmail.id,
          emailData as any,
        )) as EmailCampaign;
      } else {
        savedCampaign = await createEmailCampaign(
          emailData as CreateEmailCampaignData,
        );
      }

      onSave?.(savedCampaign);
      setCurrentStep("review");
    } catch (error) {
      console.error("Error saving email campaign:", error);
      alert("Error saving email campaign");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!existingEmail) return;

    setIsLoading(true);
    try {
      await sendEmailCampaign(existingEmail.id);
      alert("Email campaign is being sent!");
    } catch (error) {
      console.error("Error sending email campaign:", error);
      alert("Error sending email campaign");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule = async (scheduledAt: Date) => {
    if (!existingEmail) return;

    setIsLoading(true);
    try {
      await scheduleEmailCampaign(existingEmail.id, scheduledAt);
      alert("Email campaign scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling email campaign:", error);
      alert("Error scheduling email campaign");
    } finally {
      setIsLoading(false);
    }
  };

  const addComponent = (type: EmailComponentType["type"]) => {
    const newComponent: EmailComponentType = {
      id: `component_${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
    };

    if (type === "button") {
      newComponent.link = "https://example.com";
    }

    setEmailComponents([...emailComponents, newComponent]);
  };

  const getDefaultContent = (type: EmailComponentType["type"]): string => {
    switch (type) {
      case "header":
        return "Your Header Here";
      case "text":
        return "Add your text content here...";
      case "button":
        return "Click Here";
      case "image":
        return "";
      case "divider":
        return "";
      case "social":
        return "Follow Us";
      default:
        return "";
    }
  };

  const getDefaultStyles = (type: EmailComponentType["type"]): string => {
    switch (type) {
      case "header":
        return "font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px;";
      case "text":
        return "font-size: 16px; line-height: 1.5; color: #666; margin-bottom: 15px;";
      case "button":
        return "background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;";
      case "image":
        return "max-width: 100%; height: auto; margin: 10px 0;";
      case "divider":
        return "border: none; border-top: 1px solid #eee; margin: 20px 0;";
      case "social":
        return "margin: 10px 5px;";
      default:
        return "";
    }
  };

  const updateComponent = (
    id: string,
    updates: Partial<EmailComponentType>,
  ) => {
    setEmailComponents((components) =>
      components.map((comp) =>
        comp.id === id ? { ...comp, ...updates } : comp,
      ),
    );
  };

  const deleteComponent = (id: string) => {
    setEmailComponents((components) =>
      components.filter((comp) => comp.id !== id),
    );
  };

  const generateHtmlFromComponents = () => {
    return EmailTemplateEngine.createDragDropTemplate(emailComponents);
  };

  const _useTemplate = (template: ChannelTemplate) => {
    setEmailData((prev) => ({
      ...prev,
      subject: template.content.subject,
      htmlContent: template.content.htmlContent,
      templateId: template.id,
    }));
    setCurrentStep("design");
  };

  const renderStepIndicator = () => {
    const steps: { key: BuilderStep; label: string }[] = [
      { key: "setup", label: "Setup" },
      { key: "design", label: "Design" },
      { key: "content", label: "Content" },
      { key: "audience", label: "Audience" },
      { key: "schedule", label: "Schedule" },
      { key: "review", label: "Review" },
    ];

    return (
      <div className="flex items-center space-x-4 mb-8">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep;
          const isCompleted =
            steps.findIndex((s) => s.key === currentStep) > index;

          return (
            <React.Fragment key={step.key}>
              <div
                className={`flex items-center space-x-2 cursor-pointer ${
                  isActive
                    ? "text-blue-600"
                    : isCompleted
                      ? "text-green-600"
                      : "text-gray-400"
                }`}
                onClick={() => setCurrentStep(step.key)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span>{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-px ${isCompleted ? "bg-green-600" : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Email Campaign Setup</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              value={emailData.name || ""}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              From Name *
            </label>
            <input
              type="text"
              value={emailData.fromName || ""}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, fromName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Organization"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              From Email *
            </label>
            <input
              type="email"
              value={emailData.fromEmail || ""}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, fromEmail: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="noreply@yourorg.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Reply To Email
            </label>
            <input
              type="email"
              value={emailData.replyToEmail || ""}
              onChange={(e) =>
                setEmailData((prev) => ({
                  ...prev,
                  replyToEmail: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="contact@yourorg.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Subject Line *
            </label>
            <input
              type="text"
              value={emailData.subject || ""}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your compelling subject line"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Preheader (Optional)
            </label>
            <input
              type="text"
              value={emailData.preheader || ""}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, preheader: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Preview text that appears after subject line"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={abTestEnabled}
              onChange={(e) => setAbTestEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Enable A/B Testing</span>
            <TestTube className="w-4 h-4 text-blue-600" />
          </label>
          {abTestEnabled && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                A/B testing allows you to test different versions of your email
                to see which performs better. You can configure the test
                parameters in the review step.
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium mb-3">
          Choose a Template (Optional)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
            >
              <div className="mb-2">
                <h5 className="font-medium">{template.name}</h5>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {template.category}
                </span>
                <button
                  onClick={() => {
                    // Apply template content to email data
                    setEmailData((prev) => ({
                      ...prev,
                      subject: template.content?.subject || prev.subject,
                      htmlContent:
                        template.content?.htmlContent || prev.htmlContent,
                      fromName: template.content?.fromName || prev.fromName,
                    }));
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDesignStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Email Design</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Component Palette */}
          <div className="lg:col-span-1">
            <h4 className="font-medium mb-3">Components</h4>
            <div className="space-y-2">
              {[
                { type: "header" as const, icon: Type, label: "Header" },
                { type: "text" as const, icon: Type, label: "Text Block" },
                { type: "button" as const, icon: Link, label: "Button" },
                { type: "image" as const, icon: Image, label: "Image" },
                { type: "divider" as const, icon: Divide, label: "Divider" },
                {
                  type: "social" as const,
                  icon: Share2,
                  label: "Social Links",
                },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => addComponent(type)}
                  className="w-full flex items-center space-x-2 p-2 text-left border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  <Plus className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Email Builder */}
          <div className="lg:col-span-2">
            <div className="border border-gray-200 rounded-lg p-4 min-h-96">
              <h4 className="font-medium mb-3">Email Content</h4>

              {emailComponents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Add components to build your email</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emailComponents.map((component, _index) => (
                    <div
                      key={component.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">
                          {component.type}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => deleteComponent(component.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {component.type !== "divider" && (
                          <input
                            type="text"
                            value={component.content}
                            onChange={(e) =>
                              updateComponent(component.id, {
                                content: e.target.value,
                              })
                            }
                            placeholder={`${component.type} content`}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                          />
                        )}

                        {component.type === "button" && (
                          <input
                            type="url"
                            value={component.link || ""}
                            onChange={(e) =>
                              updateComponent(component.id, {
                                link: e.target.value,
                              })
                            }
                            placeholder="Button URL"
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                          />
                        )}

                        {component.type === "image" && (
                          <>
                            <input
                              type="url"
                              value={component.src || ""}
                              onChange={(e) =>
                                updateComponent(component.id, {
                                  src: e.target.value,
                                })
                              }
                              placeholder="Image URL"
                              className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                            />
                            <input
                              type="text"
                              value={component.alt || ""}
                              onChange={(e) =>
                                updateComponent(component.id, {
                                  alt: e.target.value,
                                })
                              }
                              placeholder="Alt text"
                              className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Email Content</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              HTML Content *
            </label>
            <textarea
              value={emailData.htmlContent || generateHtmlFromComponents()}
              onChange={(e) =>
                setEmailData((prev) => ({
                  ...prev,
                  htmlContent: e.target.value,
                }))
              }
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter your HTML content or use the design tools"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Text Version (Optional)
            </label>
            <textarea
              value={emailData.textContent || ""}
              onChange={(e) =>
                setEmailData((prev) => ({
                  ...prev,
                  textContent: e.target.value,
                }))
              }
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Plain text version of your email"
            />
          </div>

          {emailData.htmlContent && (
            <div>
              <h4 className="text-md font-medium mb-2">Preview</h4>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div
                  dangerouslySetInnerHTML={{ __html: emailData.htmlContent }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAudienceStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Audience</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium mb-3">Choose Segments</h4>
            <div className="space-y-2">
              {segments.map((segment) => (
                <label
                  key={segment.id}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={
                      emailData.segmentIds?.includes(segment.id) || false
                    }
                    onChange={(e) => {
                      const segmentIds = emailData.segmentIds || [];
                      if (e.target.checked) {
                        setEmailData((prev) => ({
                          ...prev,
                          segmentIds: [...segmentIds, segment.id],
                        }));
                      } else {
                        setEmailData((prev) => ({
                          ...prev,
                          segmentIds: segmentIds.filter(
                            (id) => id !== segment.id,
                          ),
                        }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{segment.name}</span>
                      <span className="text-sm text-gray-600">
                        {segment.count.toLocaleString()} recipients
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {emailData.segmentIds && emailData.segmentIds.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Audience Summary
                </span>
              </div>
              <p className="text-blue-700">
                Total recipients:{" "}
                {segments
                  .filter((s) => emailData.segmentIds!.includes(s.id))
                  .reduce((sum, s) => sum + s.count, 0)
                  .toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderScheduleStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Schedule & Send Options</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Send Type</label>
            <div className="space-y-2">
              {[
                {
                  value: "immediate" as const,
                  label: "Send Immediately",
                  icon: Send,
                },
                {
                  value: "scheduled" as const,
                  label: "Schedule for Later",
                  icon: Calendar,
                },
                {
                  value: "automated" as const,
                  label: "Automated Trigger",
                  icon: Settings,
                },
              ].map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="sendType"
                    value={value}
                    checked={emailData.sendType === value}
                    onChange={(e) =>
                      setEmailData((prev) => ({
                        ...prev,
                        sendType: e.target.value as any,
                      }))
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {emailData.sendType === "scheduled" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                value={
                  emailData.scheduledAt
                    ? new Date(emailData.scheduledAt).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setEmailData((prev) => ({
                    ...prev,
                    scheduledAt: new Date(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {emailData.sendType === "automated" && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">
                Automated emails are triggered by specific events or conditions.
                You can configure automation rules after saving the campaign.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review & Send</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Campaign Details</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Name:</dt>
                  <dd className="font-medium">{emailData.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">From:</dt>
                  <dd className="font-medium">
                    {emailData.fromName} &lt;{emailData.fromEmail}&gt;
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Subject:</dt>
                  <dd className="font-medium">{emailData.subject}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Recipients:</dt>
                  <dd className="font-medium">
                    {segments
                      .filter((s) => emailData.segmentIds?.includes(s.id))
                      .reduce((sum, s) => sum + s.count, 0)
                      .toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Send Type:</dt>
                  <dd className="font-medium capitalize">
                    {emailData.sendType}
                  </dd>
                </div>
              </dl>
            </div>

            {existingEmail && (
              <div className="space-y-2">
                <button
                  onClick={handleSend}
                  disabled={isLoading || emailData.sendType !== "immediate"}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{isLoading ? "Sending..." : "Send Now"}</span>
                </button>

                {emailData.sendType === "scheduled" &&
                  emailData.scheduledAt && (
                    <button
                      onClick={() =>
                        handleSchedule(new Date(emailData.scheduledAt!))
                      }
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{isLoading ? "Scheduling..." : "Schedule"}</span>
                    </button>
                  )}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Email Preview</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
              {emailData.htmlContent ? (
                <div
                  dangerouslySetInnerHTML={{ __html: emailData.htmlContent }}
                />
              ) : (
                <p className="text-gray-500 italic">No content to preview</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {existingEmail ? "Edit" : "Create"} Email Campaign
          </h2>

          <div className="flex items-center space-x-3">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-4 h-4" />
              <span>{isLoading ? "Saving..." : "Save Campaign"}</span>
            </button>
          </div>
        </div>

        {renderStepIndicator()}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {currentStep === "setup" && renderSetupStep()}
        {currentStep === "design" && renderDesignStep()}
        {currentStep === "content" && renderContentStep()}
        {currentStep === "audience" && renderAudienceStep()}
        {currentStep === "schedule" && renderScheduleStep()}
        {currentStep === "review" && renderReviewStep()}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => {
            const steps: BuilderStep[] = [
              "setup",
              "design",
              "content",
              "audience",
              "schedule",
              "review",
            ];
            const currentIndex = steps.indexOf(currentStep);
            if (currentIndex > 0) {
              setCurrentStep(steps[currentIndex - 1]);
            }
          }}
          disabled={currentStep === "setup"}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Previous</span>
        </button>

        <button
          onClick={() => {
            const steps: BuilderStep[] = [
              "setup",
              "design",
              "content",
              "audience",
              "schedule",
              "review",
            ];
            const currentIndex = steps.indexOf(currentStep);
            if (currentIndex < steps.length - 1) {
              setCurrentStep(steps[currentIndex + 1]);
            }
          }}
          disabled={currentStep === "review"}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next</span>
        </button>
      </div>
    </div>
  );
};
