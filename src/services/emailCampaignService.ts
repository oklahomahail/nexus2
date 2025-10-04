// src/services/emailCampaignService.ts

import type {
  EmailCampaign,
  CreateEmailCampaignData,
  UpdateChannelData,
  ChannelTemplate,
  AutomationRule,
} from "@/models/channels";
import { logger } from "@/utils/logger";

// Mock data for development - replace with real API calls
const mockEmailCampaigns: EmailCampaign[] = [];

// Email Template Engine
export class EmailTemplateEngine {
  private static templates: Map<string, ChannelTemplate> = new Map();

  static registerTemplate(template: ChannelTemplate) {
    this.templates.set(template.id, template);
  }

  static getTemplate(id: string): ChannelTemplate | null {
    return this.templates.get(id) || null;
  }

  static getAllTemplates(): ChannelTemplate[] {
    return Array.from(this.templates.values());
  }

  static renderTemplate(
    templateId: string,
    variables: Record<string, any>,
  ): { htmlContent: string; textContent?: string; subject?: string } {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const { htmlContent, textContent, subject } = template.content;

    // Simple template variable replacement
    const replaceVariables = (content: string) => {
      return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] || match;
      });
    };

    return {
      htmlContent: htmlContent ? replaceVariables(htmlContent) : "",
      textContent: textContent ? replaceVariables(textContent) : undefined,
      subject: subject ? replaceVariables(subject) : undefined,
    };
  }

  // Email Builder Component Data Structure
  static createDragDropTemplate(components: EmailComponent[]): string {
    // Convert drag-and-drop components to HTML
    return components
      .map((component) => this.renderComponent(component))
      .join("\n");
  }

  private static renderComponent(component: EmailComponent): string {
    switch (component.type) {
      case "header":
        return `<header style="${component.styles}">${component.content}</header>`;
      case "text":
        return `<div style="${component.styles}">${component.content}</div>`;
      case "button":
        return `<a href="${component.link}" style="${component.styles}" class="email-button">${component.content}</a>`;
      case "image":
        return `<img src="${component.src}" alt="${component.alt}" style="${component.styles}">`;
      case "divider":
        return `<hr style="${component.styles}">`;
      case "social":
        return (
          component.socialLinks
            ?.map(
              (link) =>
                `<a href="${link.url}" style="${component.styles}"><img src="${link.icon}" alt="${link.platform}"></a>`,
            )
            .join(" ") || ""
        );
      default:
        return "";
    }
  }
}

// Email Component Types for Drag-and-Drop Builder
export interface EmailComponent {
  id: string;
  type: "header" | "text" | "button" | "image" | "divider" | "social";
  content: string;
  styles: string;
  link?: string;
  src?: string;
  alt?: string;
  socialLinks?: {
    platform: string;
    url: string;
    icon: string;
  }[];
}

// A/B Testing Engine
export class ABTestEngine {
  static createABTest(
    emailCampaign: EmailCampaign,
    config: EmailCampaign["abTestConfig"],
  ): { variantA: Partial<EmailCampaign>; variantB: Partial<EmailCampaign> } {
    if (!config) throw new Error("A/B test config is required");

    const { variantA, variantB } = config;

    return {
      variantA: {
        ...emailCampaign,
        subject: variantA.subject || emailCampaign.subject,
        htmlContent: variantA.content || emailCampaign.htmlContent,
        fromName: variantA.fromName || emailCampaign.fromName,
      },
      variantB: {
        ...emailCampaign,
        subject: variantB.subject || emailCampaign.subject,
        htmlContent: variantB.content || emailCampaign.htmlContent,
        fromName: variantB.fromName || emailCampaign.fromName,
      },
    };
  }

  static calculateWinner(
    campaignId: string,
    metrics: { variantA: any; variantB: any },
    criteria: "open_rate" | "click_rate" | "conversion_rate" | undefined,
  ): "A" | "B" | "tie" {
    const { variantA, variantB } = metrics;

    let scoreA: number, scoreB: number;

    switch (criteria) {
      case "open_rate":
        scoreA = variantA.openRate || 0;
        scoreB = variantB.openRate || 0;
        break;
      case "click_rate":
        scoreA = variantA.clickRate || 0;
        scoreB = variantB.clickRate || 0;
        break;
      case "conversion_rate":
        scoreA = variantA.conversionRate || 0;
        scoreB = variantB.conversionRate || 0;
        break;
      default:
        return "tie";
    }

    if (Math.abs(scoreA - scoreB) < 0.05) return "tie"; // 5% threshold
    return scoreA > scoreB ? "A" : "B";
  }
}

// Email Automation Engine
export class EmailAutomationEngine {
  private static rules: Map<string, AutomationRule> = new Map();

  static registerRule(rule: AutomationRule) {
    this.rules.set(rule.id, rule);
  }

  static executeRule(ruleId: string, triggerData: any): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (!rule || !rule.isActive) return Promise.resolve();

    return this.processActions(rule.actions, triggerData);
  }

  private static async processActions(
    actions: AutomationRule["actions"],
    triggerData: any,
  ): Promise<void> {
    for (const action of actions) {
      if (action.delay && action.delay > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, (action.delay || 0) * 60 * 1000),
        );
      }

      switch (action.type) {
        case "send_email":
          await this.sendAutomatedEmail(action.parameters, triggerData);
          break;
        case "add_to_segment":
          await this.addToSegment(action.parameters, triggerData);
          break;
        case "update_field":
          await this.updateDonorField(action.parameters, triggerData);
          break;
        case "wait":
          // Already handled by delay above
          break;
      }
    }
  }

  private static async sendAutomatedEmail(
    parameters: any,
    triggerData: any,
  ): Promise<void> {
    // Implementation would send email through email service provider
    logger.info("Automated email triggered", { parameters, triggerData });
  }

  private static async addToSegment(
    parameters: any,
    triggerData: any,
  ): Promise<void> {
    // Implementation would add donor to segment
    logger.info("Adding to segment", { parameters, triggerData });
  }

  private static async updateDonorField(
    parameters: any,
    triggerData: any,
  ): Promise<void> {
    // Implementation would update donor profile
    logger.info("Updating donor field", { parameters, triggerData });
  }
}

// Main Email Campaign Service Functions
export const createEmailCampaign = async (
  data: CreateEmailCampaignData,
): Promise<EmailCampaign> => {
  try {
    // In a real implementation, this would call your backend API
    const newCampaign: EmailCampaign = {
      id: `email_${Date.now()}`,
      type: "email",
      name: data.name,
      campaignId: data.campaignId,
      clientId: data.clientId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "current-user", // Get from auth context
      fromName: data.fromName,
      fromEmail: data.fromEmail,
      subject: data.subject,
      htmlContent: data.htmlContent,
      segmentIds: data.segmentIds,
      sendType: data.sendType,
      scheduledAt: data.scheduledAt,
      hashtags: [],
      status: "draft",
      metrics: {
        sent: 0,
        delivered: 0,
        bounced: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        complained: 0,
        converted: 0,
        revenue: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        unsubscribeRate: 0,
        bounceRate: 0,
      },
    };

    mockEmailCampaigns.push(newCampaign);
    logger.info("Email campaign created successfully:", newCampaign.id);
    return newCampaign;
  } catch (error) {
    logger.error("Error creating email campaign:", error);
    throw error;
  }
};

export const getEmailCampaignById = async (
  id: string,
): Promise<EmailCampaign | null> => {
  try {
    const campaign = mockEmailCampaigns.find((c) => c.id === id);
    return campaign || null;
  } catch (error) {
    logger.error("Error getting email campaign by ID:", error);
    throw error;
  }
};

export const getAllEmailCampaigns = async (
  clientId?: string,
): Promise<EmailCampaign[]> => {
  try {
    let campaigns = mockEmailCampaigns;
    if (clientId) {
      campaigns = campaigns.filter((c) => c.clientId === clientId);
    }
    return campaigns;
  } catch (error) {
    logger.error("Error getting email campaigns:", error);
    throw error;
  }
};

export const getEmailCampaignsByCampaign = async (
  campaignId: string,
): Promise<EmailCampaign[]> => {
  try {
    return mockEmailCampaigns.filter((c) => c.campaignId === campaignId);
  } catch (error) {
    logger.error("Error getting email campaigns by campaign:", error);
    throw error;
  }
};

export const updateEmailCampaign = async (
  id: string,
  data: UpdateChannelData,
): Promise<EmailCampaign | null> => {
  try {
    const index = mockEmailCampaigns.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updatedCampaign = {
      ...mockEmailCampaigns[index],
      ...data,
      updatedAt: new Date(),
    } as EmailCampaign;

    mockEmailCampaigns[index] = updatedCampaign;
    logger.info("Email campaign updated successfully:", id);
    return updatedCampaign;
  } catch (error) {
    logger.error("Error updating email campaign:", error);
    throw error;
  }
};

export const deleteEmailCampaign = async (id: string): Promise<boolean> => {
  try {
    const index = mockEmailCampaigns.findIndex((c) => c.id === id);
    if (index === -1) return false;

    mockEmailCampaigns.splice(index, 1);
    logger.info("Email campaign deleted successfully:", id);
    return true;
  } catch (error) {
    logger.error("Error deleting email campaign:", error);
    throw error;
  }
};

export const sendEmailCampaign = async (id: string): Promise<boolean> => {
  try {
    const campaign = await getEmailCampaignById(id);
    if (!campaign) return false;

    // Update status to sending
    await updateEmailCampaign(id, { status: "sending" });

    // In a real implementation, this would integrate with an email service provider
    // like SendGrid, Mailgun, Amazon SES, etc.

    // Simulate sending process
    setTimeout(async () => {
      // Update metrics with mock data
      const mockMetrics = {
        sent: Math.floor(Math.random() * 1000) + 500,
        delivered: 0, // Will be calculated
        opened: 0, // Will be calculated
        clicked: 0, // Will be calculated
      };

      mockMetrics.delivered = Math.floor(
        mockMetrics.sent * (0.95 + Math.random() * 0.04),
      ); // 95-99% delivery
      mockMetrics.opened = Math.floor(
        mockMetrics.delivered * (0.15 + Math.random() * 0.25),
      ); // 15-40% open rate
      mockMetrics.clicked = Math.floor(
        mockMetrics.opened * (0.02 + Math.random() * 0.08),
      ); // 2-10% click rate

      await updateEmailCampaign(id, {
        status: "sent",
        metrics: {
          ...campaign.metrics,
          ...mockMetrics,
          openRate: (mockMetrics.opened / mockMetrics.delivered) * 100,
          clickRate: (mockMetrics.clicked / mockMetrics.opened) * 100,
          bounceRate:
            ((mockMetrics.sent - mockMetrics.delivered) / mockMetrics.sent) *
            100,
        },
      } as any);
    }, 2000);

    logger.info("Email campaign sending initiated:", id);
    return true;
  } catch (error) {
    logger.error("Error sending email campaign:", error);
    throw error;
  }
};

export const pauseEmailCampaign = async (id: string): Promise<boolean> => {
  try {
    const result = await updateEmailCampaign(id, { status: "paused" });
    return result !== null;
  } catch (error) {
    logger.error("Error pausing email campaign:", error);
    throw error;
  }
};

export const scheduleEmailCampaign = async (
  id: string,
  scheduledAt: Date,
): Promise<boolean> => {
  try {
    const result = await updateEmailCampaign(id, {
      status: "scheduled",
      scheduledAt,
    } as any);
    return result !== null;
  } catch (error) {
    logger.error("Error scheduling email campaign:", error);
    throw error;
  }
};

// Email List Management
export const getEmailSegments = async (
  _clientId: string,
): Promise<Array<{ id: string; name: string; count: number }>> => {
  // Mock segments - in real implementation, this would fetch from donor segments service
  return [
    { id: "seg_1", name: "Major Donors", count: 150 },
    { id: "seg_2", name: "Monthly Donors", count: 500 },
    { id: "seg_3", name: "Lapsed Donors", count: 1200 },
    { id: "seg_4", name: "Newsletter Subscribers", count: 3500 },
    { id: "seg_5", name: "Event Attendees", count: 300 },
  ];
};

// Email Deliverability & Analytics
export const getEmailDeliverabilityStats = async (
  _clientId: string,
): Promise<{
  reputation: number;
  spamScore: number;
  blacklistStatus: boolean;
  domainAuthentication: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  };
}> => {
  // Mock deliverability data
  return {
    reputation: 85, // 0-100 score
    spamScore: 2.1, // Lower is better
    blacklistStatus: false,
    domainAuthentication: {
      spf: true,
      dkim: true,
      dmarc: false,
    },
  };
};

// Initialize default email templates
export const initializeEmailTemplates = () => {
  const defaultTemplates: ChannelTemplate[] = [
    {
      id: "email_welcome",
      name: "Welcome Email",
      description: "Welcome new donors and subscribers",
      type: "email",
      category: "onboarding",
      content: {
        subject: "Welcome to {{organization_name}}!",
        htmlContent: `
          <h1>Welcome, {{first_name}}!</h1>
          <p>Thank you for joining {{organization_name}}. We're excited to have you as part of our community.</p>
          <p>Here's what you can expect from us:</p>
          <ul>
            <li>Monthly updates on our impact</li>
            <li>Exclusive donor stories</li>
            <li>Opportunities to get involved</li>
          </ul>
          <p>Best regards,<br>The {{organization_name}} Team</p>
        `,
        textContent: `Welcome, {{first_name}}! Thank you for joining {{organization_name}}...`,
      },
      config: {
        isPublic: true,
        tags: ["welcome", "onboarding", "donor"],
        difficulty: "beginner",
        estimatedSetupTime: 15,
      },
      usage: {
        timesUsed: 0,
        rating: 4.5,
        reviews: 12,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
    },
    {
      id: "email_donation_thank_you",
      name: "Donation Thank You",
      description: "Thank donors for their contribution",
      type: "email",
      category: "transactional",
      content: {
        subject: "Thank you for your donation, {{first_name}}!",
        htmlContent: `
          <h1>Thank You!</h1>
          <p>Dear {{first_name}},</p>
          <p>Thank you for your generous donation of {{donation_amount}} to {{campaign_name}}.</p>
          <p>Your contribution makes a real difference in {{cause_area}}.</p>
          <p>Tax-deductible receipt: #{{receipt_number}}</p>
          <p>With gratitude,<br>{{organization_name}}</p>
        `,
      },
      config: {
        isPublic: true,
        tags: ["thank-you", "donation", "receipt"],
        difficulty: "beginner",
        estimatedSetupTime: 10,
      },
      usage: {
        timesUsed: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
    },
  ];

  defaultTemplates.forEach((template) => {
    EmailTemplateEngine.registerTemplate(template);
  });

  logger.info(`Initialized ${defaultTemplates.length} default email templates`);
};

// Initialize templates on service load
initializeEmailTemplates();
