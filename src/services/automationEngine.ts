// src/services/automationEngine.ts

import type { AutomationRule } from "@/models/channels";
import { logger } from "@/utils/logger";

import { createEmailCampaign, sendEmailCampaign } from "./emailCampaignService";
import {
  createSocialMediaPost,
  publishSocialMediaPost,
} from "./socialMediaService";

// Automation Engine Core Classes
export class AutomationEngine {
  private static instance: AutomationEngine;
  private automationRules: Map<string, AutomationRule> = new Map();
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Map<string, Set<string>> = new Map(); // eventType -> ruleIds
  private executionHistory: AutomationExecution[] = [];

  private constructor() {
    this.initializeEventListeners();
  }

  static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  // Rule Management
  registerRule(rule: AutomationRule): void {
    this.automationRules.set(rule.id!, rule);
    this.setupRuleTriggers(rule);
    logger.info(`Automation rule registered: ${rule.name}`, {
      ruleId: rule.id,
    });
  }

  unregisterRule(ruleId: string): void {
    const rule = this.automationRules.get(ruleId);
    if (rule) {
      this.cleanupRuleTriggers(rule);
      this.automationRules.delete(ruleId);
      logger.info(`Automation rule unregistered: ${rule.name}`, { ruleId });
    }
  }

  updateRule(ruleId: string, updates: Partial<AutomationRule>): void {
    const existingRule = this.automationRules.get(ruleId);
    if (existingRule) {
      this.cleanupRuleTriggers(existingRule);
      const updatedRule = { ...existingRule, ...updates };
      this.automationRules.set(ruleId, updatedRule);

      if (updatedRule.isActive) {
        this.setupRuleTriggers(updatedRule);
      }

      logger.info(`Automation rule updated: ${updatedRule.name}`, { ruleId });
    }
  }

  getAllRules(clientId?: string): AutomationRule[] {
    const rules = Array.from(this.automationRules.values());
    return clientId
      ? rules.filter((rule) => rule.clientId === clientId)
      : rules;
  }

  // Event Handling
  triggerEvent(eventType: string, eventData: any): void {
    const ruleIds = this.eventListeners.get(eventType) || new Set();

    for (const ruleId of ruleIds) {
      const rule = this.automationRules.get(ruleId);
      if (rule && rule.isActive) {
        void this.evaluateRule(rule, eventData);
      }
    }
  }

  // Core Automation Logic
  private async evaluateRule(
    rule: AutomationRule,
    eventData: any,
  ): Promise<void> {
    try {
      const shouldExecute = this.evaluateTriggerConditions(
        rule.trigger,
        eventData,
      );

      if (shouldExecute) {
        const execution: AutomationExecution = {
          id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ruleId: rule.id!,
          ruleName: rule.name,
          triggeredAt: new Date(),
          eventData,
          status: "running",
          actions: [],
        };

        this.executionHistory.push(execution);
        await this.executeActions(rule.actions, eventData, execution);

        // Update rule execution stats
        if (rule.executions) {
          rule.executions.triggered++;
          if (execution.status === "completed") {
            rule.executions.successful++;
          } else if (execution.status === "failed") {
            rule.executions.failed++;
          }
          rule.executions.lastTriggered = new Date();
        }

        logger.info(`Automation rule executed: ${rule.name}`, {
          ruleId: rule.id,
          executionId: execution.id,
          status: execution.status,
        });
      }
    } catch (error) {
      logger.error(`Error evaluating automation rule: ${rule.name}`, {
        ruleId: rule.id,
        error,
      });
    }
  }

  private evaluateTriggerConditions(
    trigger: AutomationRule["trigger"],
    eventData: any,
  ): boolean {
    if (!trigger.conditions || trigger.conditions.length === 0) {
      return true; // No conditions means always trigger
    }

    return trigger.conditions.every((condition) => {
      const fieldValue = this.getNestedValue(eventData, condition.field);

      switch (condition.operator) {
        case "equals":
          return fieldValue === condition.value;
        case "not_equals":
          return fieldValue !== condition.value;
        case "greater_than":
          return Number(fieldValue) > Number(condition.value);
        case "less_than":
          return Number(fieldValue) < Number(condition.value);
        case "contains":
          return String(fieldValue)
            .toLowerCase()
            .includes(String(condition.value).toLowerCase());
        case "exists":
          return fieldValue !== undefined && fieldValue !== null;
        default:
          logger.warn(`Unknown condition operator: ${condition.operator}`);
          return false;
      }
    });
  }

  private async executeActions(
    actions: AutomationRule["actions"],
    eventData: any,
    execution: AutomationExecution,
  ): Promise<void> {
    try {
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const actionExecution: ActionExecution = {
          actionIndex: i,
          actionType: action.type,
          startedAt: new Date(),
          status: "running",
        };

        execution.actions.push(actionExecution);

        // Handle delays
        if (action.delay && action.delay > 0) {
          await this.delay(action.delay * 60 * 1000); // Convert minutes to milliseconds
        }

        try {
          await this.executeAction(action, eventData);
          actionExecution.status = "completed";
          actionExecution.completedAt = new Date();
        } catch (actionError) {
          actionExecution.status = "failed";
          actionExecution.error =
            actionError instanceof Error
              ? actionError.message
              : "Unknown error";
          actionExecution.completedAt = new Date();

          logger.error(`Action failed in automation rule`, {
            actionType: action.type,
            actionIndex: i,
            error: actionError,
          });

          // Continue with next action unless it's critical
          continue;
        }
      }

      execution.status = execution.actions.some((a) => a.status === "failed")
        ? "partial"
        : "completed";
    } catch (error) {
      execution.status = "failed";
      execution.error =
        error instanceof Error ? error.message : "Unknown error";
    } finally {
      execution.completedAt = new Date();
    }
  }

  private async executeAction(
    action: AutomationRule["actions"][0],
    eventData: any,
  ): Promise<void> {
    switch (action.type) {
      case "send_email":
        await this.sendEmailAction(action, eventData);
        break;
      case "post_social":
        await this.postSocialAction(action, eventData);
        break;
      case "send_direct_mail":
        await this.sendDirectMailAction(action, eventData);
        break;
      case "add_to_segment":
        await this.addToSegmentAction(action, eventData);
        break;
      case "update_field":
        await this.updateFieldAction(action, eventData);
        break;
      case "wait":
        // Wait action is handled by the delay mechanism above
        break;
      default:
        logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  // Action Implementations
  private async sendEmailAction(
    action: AutomationRule["actions"][0],
    eventData: any,
  ): Promise<void> {
    const { parameters } = action;
    const { templateId, subject, content, segmentIds, fromName, fromEmail } =
      parameters || {};

    try {
      // Create email campaign
      const emailData = {
        name: `Automated Email - ${templateId || "Custom"}`,
        campaignId: eventData.campaignId,
        clientId: eventData.clientId,
        fromName: fromName || "Your Organization",
        fromEmail: fromEmail || "noreply@yourorg.com",
        subject: subject || "Automated Follow-up",
        htmlContent: content || this.getTemplateContent(templateId),
        segmentIds: segmentIds || [eventData.segmentId],
        sendType: "immediate" as const,
      };

      const emailCampaign = await createEmailCampaign(emailData);
      await sendEmailCampaign(emailCampaign.id);

      logger.info("Automated email sent", {
        emailId: emailCampaign.id,
        templateId,
      });
    } catch (error) {
      logger.error("Failed to send automated email", { error, parameters });
      throw error;
    }
  }

  private async postSocialAction(
    action: AutomationRule["actions"][0],
    eventData: any,
  ): Promise<void> {
    const { parameters } = action;
    const { platforms, message, hashtags } = parameters || {};

    try {
      const socialPostData = {
        name: "Automated Social Post",
        campaignId: eventData.campaignId,
        clientId: eventData.clientId,
        platforms: platforms || ["facebook"],
        message: message || "Thank you for your support!",
        hashtags: hashtags || ["#nonprofit", "#thankyou"],
        publishType: "immediate" as const,
      };

      const socialPost = await createSocialMediaPost(socialPostData);
      await publishSocialMediaPost(socialPost.id);

      logger.info("Automated social post published", {
        postId: socialPost.id,
        platforms,
      });
    } catch (error) {
      logger.error("Failed to post automated social media", {
        error,
        parameters,
      });
      throw error;
    }
  }

  private async sendDirectMailAction(
    action: AutomationRule["actions"][0],
    eventData: any,
  ): Promise<void> {
    const { parameters } = action;

    // For now, log the intent - direct mail would integrate with printing/mailing services
    logger.info("Automated direct mail triggered", { parameters, eventData });

    // In a real implementation, this would:
    // 1. Create direct mail campaign
    // 2. Generate print-ready content
    // 3. Submit to printing service
    // 4. Track delivery status
  }

  private async addToSegmentAction(
    action: AutomationRule["actions"][0],
    eventData: any,
  ): Promise<void> {
    const { parameters } = action;
    const { segmentId } = parameters || {};

    // Mock implementation - in reality would update donor segments
    logger.info("Donor added to segment via automation", {
      segmentId,
      donorId: eventData.donorId,
    });
  }

  private async updateFieldAction(
    action: AutomationRule["actions"][0],
    eventData: any,
  ): Promise<void> {
    const { parameters } = action;
    const { fieldName, value } = parameters || {};

    // Mock implementation - in reality would update donor/campaign fields
    logger.info("Field updated via automation", {
      fieldName,
      value,
      targetId: eventData.donorId || eventData.campaignId,
    });
  }

  // Scheduling and Trigger Setup
  private setupRuleTriggers(rule: AutomationRule): void {
    if (!rule.isActive) return;

    const { trigger } = rule;

    if (trigger.type === "time_based" && trigger.schedule) {
      this.setupTimeBasedTrigger(rule);
    } else {
      this.setupEventBasedTrigger(rule);
    }
  }

  private setupTimeBasedTrigger(rule: AutomationRule): void {
    const { schedule } = rule.trigger;
    if (!schedule) return;

    let intervalMs: number;

    switch (schedule.frequency) {
      case "daily":
        intervalMs = 24 * 60 * 60 * 1000; // 24 hours
        break;
      case "weekly":
        intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case "monthly":
        intervalMs = 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
      default:
        return;
    }

    const taskId = `time_trigger_${rule.id}`;

    // Calculate next execution time
    const now = new Date();
    let nextExecution = new Date();

    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(":").map(Number);
      nextExecution.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (nextExecution <= now) {
        nextExecution.setDate(nextExecution.getDate() + 1);
      }
    }

    // Set up recurring timer
    const executeAndReschedule = () => {
      void this.evaluateRule(rule, {
        triggerType: "time_based",
        scheduledTime: new Date(),
      });

      // Schedule next execution
      const timeout = setTimeout(executeAndReschedule, intervalMs);
      this.scheduledTasks.set(taskId, timeout);
    };

    // Schedule first execution
    const initialDelay = nextExecution.getTime() - now.getTime();
    const timeout = setTimeout(executeAndReschedule, initialDelay);
    this.scheduledTasks.set(taskId, timeout);
  }

  private setupEventBasedTrigger(rule: AutomationRule): void {
    const eventTypes = this.getEventTypesForRule(rule);

    eventTypes.forEach((eventType) => {
      if (!this.eventListeners.has(eventType)) {
        this.eventListeners.set(eventType, new Set());
      }
      this.eventListeners.get(eventType)!.add(rule.id!);
    });
  }

  private getEventTypesForRule(rule: AutomationRule): string[] {
    const { trigger } = rule;

    switch (trigger.type) {
      case "engagement_based":
        return [
          "email_opened",
          "email_clicked",
          "email_not_opened",
          "social_engaged",
        ];
      case "behavior_based":
        return [
          "donation_made",
          "page_visited",
          "form_submitted",
          "event_registered",
        ];
      case "data_based":
        return ["profile_updated", "segment_changed", "score_changed"];
      default:
        return ["generic_event"];
    }
  }

  private cleanupRuleTriggers(rule: AutomationRule): void {
    // Clean up scheduled tasks
    const taskId = `time_trigger_${rule.id}`;
    const timeout = this.scheduledTasks.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledTasks.delete(taskId);
    }

    // Clean up event listeners
    for (const [eventType, ruleIds] of this.eventListeners.entries()) {
      ruleIds.delete(rule.id!);
      if (ruleIds.size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }

  private initializeEventListeners(): void {
    // Set up common automation triggers
    this.setupEmailEventListeners();
    this.setupDonationEventListeners();
    this.setupEngagementEventListeners();
  }

  private setupEmailEventListeners(): void {
    // In a real implementation, these would be triggered by email service webhooks
    // For now, we simulate them periodically

    setInterval(
      () => {
        // Simulate email not opened after 48 hours
        void this.triggerEvent("email_not_opened", {
          emailId: "sample_email_id",
          campaignId: "sample_campaign_id",
          donorId: "sample_donor_id",
          sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        });
      },
      60 * 60 * 1000,
    ); // Check every hour
  }

  private setupDonationEventListeners(): void {
    // Would integrate with donation processing system
    // Trigger thank you emails, social posts, etc.
  }

  private setupEngagementEventListeners(): void {
    // Would integrate with analytics systems
    // Track website visits, social media engagement, etc.
  }

  // Utility Methods
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getTemplateContent(templateId?: string): string {
    // Mock template content - in reality would load from template service
    const templates: Record<string, string> = {
      follow_up_template: `
        <h2>We Haven't Heard From You</h2>
        <p>Hi there,</p>
        <p>We sent you an email recently but haven't heard back. We wanted to make sure you saw our important message about our current campaign.</p>
        <p>Your support means everything to us, and we'd love to have you as part of this effort.</p>
        <p><a href="#" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Learn More</a></p>
        <p>Thank you for your time.</p>
      `,
      thank_you_template: `
        <h2>Thank You for Your Generous Gift!</h2>
        <p>Dear Friend,</p>
        <p>Thank you for your generous donation. Your support makes a real difference in our community.</p>
        <p>We'll send you updates on how your contribution is being used to further our mission.</p>
        <p>With gratitude,<br>The Team</p>
      `,
      welcome_template: `
        <h2>Welcome to Our Community!</h2>
        <p>Thank you for joining us. We're excited to have you as part of our mission.</p>
        <p>Here's what you can expect:</p>
        <ul>
          <li>Regular updates on our impact</li>
          <li>Exclusive stories from the field</li>
          <li>Opportunities to get more involved</li>
        </ul>
      `,
    };

    return (
      templates[templateId || "follow_up_template"] ||
      templates.follow_up_template
    );
  }

  // Analytics and Reporting
  getExecutionHistory(
    ruleId?: string,
    limit: number = 100,
  ): AutomationExecution[] {
    let history = this.executionHistory;

    if (ruleId) {
      history = history.filter((exec) => exec.ruleId === ruleId);
    }

    return history
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, limit);
  }

  getAutomationStats(clientId?: string): AutomationStats {
    const rules = this.getAllRules(clientId);
    const executions = clientId
      ? this.executionHistory.filter((exec) => {
          const rule = this.automationRules.get(exec.ruleId);
          return rule?.clientId === clientId;
        })
      : this.executionHistory;

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentExecutions = executions.filter(
      (exec) => exec.triggeredAt >= last30Days,
    );

    return {
      totalRules: rules.length,
      activeRules: rules.filter((rule) => rule.isActive).length,
      totalExecutions: executions.length,
      recentExecutions: recentExecutions.length,
      successfulExecutions: executions.filter(
        (exec) => exec.status === "completed",
      ).length,
      failedExecutions: executions.filter((exec) => exec.status === "failed")
        .length,
      averageExecutionTime: this.calculateAverageExecutionTime(executions),
      topPerformingRules: this.getTopPerformingRules(rules, executions),
    };
  }

  private calculateAverageExecutionTime(
    executions: AutomationExecution[],
  ): number {
    const completedExecutions = executions.filter(
      (exec) => exec.status === "completed" && exec.completedAt,
    );

    if (completedExecutions.length === 0) return 0;

    const totalTime = completedExecutions.reduce((sum, exec) => {
      const duration = exec.completedAt!.getTime() - exec.triggeredAt.getTime();
      return sum + duration;
    }, 0);

    return Math.round(totalTime / completedExecutions.length);
  }

  private getTopPerformingRules(
    rules: AutomationRule[],
    executions: AutomationExecution[],
  ): Array<{
    ruleId: string;
    ruleName: string;
    executionCount: number;
    successRate: number;
  }> {
    const ruleStats = new Map<
      string,
      { execCount: number; successCount: number }
    >();

    executions.forEach((exec) => {
      const current = ruleStats.get(exec.ruleId) || {
        execCount: 0,
        successCount: 0,
      };
      current.execCount++;
      if (exec.status === "completed") {
        current.successCount++;
      }
      ruleStats.set(exec.ruleId, current);
    });

    return Array.from(ruleStats.entries())
      .map(([ruleId, stats]) => {
        const rule = this.automationRules.get(ruleId);
        return {
          ruleId,
          ruleName: rule?.name || "Unknown Rule",
          executionCount: stats.execCount,
          successRate:
            stats.execCount > 0
              ? (stats.successCount / stats.execCount) * 100
              : 0,
        };
      })
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(0, 5);
  }
}

// Types for automation execution tracking
interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: Date;
  completedAt?: Date;
  status: "running" | "completed" | "failed" | "partial";
  eventData: any;
  actions: ActionExecution[];
  error?: string;
}

interface ActionExecution {
  actionIndex: number;
  actionType: string;
  startedAt: Date;
  completedAt?: Date;
  status: "running" | "completed" | "failed";
  error?: string;
}

interface AutomationStats {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  recentExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number; // milliseconds
  topPerformingRules: Array<{
    ruleId: string;
    ruleName: string;
    executionCount: number;
    successRate: number;
  }>;
}

// Automation Service Functions (Public API)
const automationEngine = AutomationEngine.getInstance();

export const registerAutomationRule = (rule: AutomationRule): void => {
  automationEngine.registerRule(rule);
};

export const unregisterAutomationRule = (ruleId: string): void => {
  automationEngine.unregisterRule(ruleId);
};

export const updateAutomationRule = (
  ruleId: string,
  updates: Partial<AutomationRule>,
): void => {
  automationEngine.updateRule(ruleId, updates);
};

export const getAllAutomationRules = (clientId?: string): AutomationRule[] => {
  return automationEngine.getAllRules(clientId);
};

export const triggerAutomationEvent = (
  eventType: string,
  eventData: any,
): void => {
  automationEngine.triggerEvent(eventType, eventData);
};

export const getAutomationExecutionHistory = (
  ruleId?: string,
  limit?: number,
): AutomationExecution[] => {
  return automationEngine.getExecutionHistory(ruleId, limit);
};

export const getAutomationStatistics = (clientId?: string): AutomationStats => {
  return automationEngine.getAutomationStats(clientId);
};

// Convenience functions for common automation events
export const triggerEmailEvent = (
  eventType: "opened" | "clicked" | "not_opened",
  data: {
    emailId: string;
    campaignId: string;
    donorId: string;
    clientId: string;
  },
): void => {
  triggerAutomationEvent(`email_${eventType}`, data);
};

export const triggerDonationEvent = (data: {
  donationId: string;
  amount: number;
  donorId: string;
  campaignId: string;
  clientId: string;
}): void => {
  triggerAutomationEvent("donation_made", data);
};

export const triggerEngagementEvent = (eventType: string, data: any): void => {
  triggerAutomationEvent(eventType, data);
};

// Initialize default automation rules
export const initializeDefaultAutomationRules = (
  clientId: string,
  campaignId: string,
): void => {
  const defaultRules: Partial<AutomationRule>[] = [
    {
      id: `welcome_${clientId}`,
      name: "Welcome New Subscribers",
      campaignId,
      clientId,
      trigger: {
        type: "behavior_based",
        conditions: [
          {
            field: "event_type",
            operator: "equals",
            value: "subscription_confirmed",
          },
        ],
      },
      actions: [
        {
          type: "send_email",
          parameters: {
            templateId: "welcome_template",
            subject: "Welcome to our community!",
          },
          delay: 5, // 5 minutes after subscription
        },
      ],
      isActive: true,
      executions: {
        triggered: 0,
        successful: 0,
        failed: 0,
      },
    },
    {
      id: `followup_${clientId}`,
      name: "Follow-up Non-Openers",
      campaignId,
      clientId,
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
            subject: "Did you see our message?",
          },
        },
      ],
      isActive: true,
      executions: {
        triggered: 0,
        successful: 0,
        failed: 0,
      },
    },
    {
      id: `thankyou_${clientId}`,
      name: "Thank You After Donation",
      campaignId,
      clientId,
      trigger: {
        type: "behavior_based",
        conditions: [
          {
            field: "event_type",
            operator: "equals",
            value: "donation_made",
          },
        ],
      },
      actions: [
        {
          type: "send_email",
          parameters: {
            templateId: "thank_you_template",
            subject: "Thank you for your generous gift!",
          },
          delay: 15, // 15 minutes after donation
        },
        {
          type: "post_social",
          parameters: {
            message:
              "Thank you to all our amazing supporters! Every donation makes a difference. 🙏",
            platforms: ["facebook", "twitter"],
            hashtags: ["#thankyou", "#nonprofit", "#community"],
          },
          delay: 60, // 1 hour after donation
        },
      ],
      isActive: true,
      executions: {
        triggered: 0,
        successful: 0,
        failed: 0,
      },
    },
  ];

  defaultRules.forEach((rule) => {
    if (rule.id) {
      registerAutomationRule(rule as AutomationRule);
    }
  });

  logger.info(
    `Initialized ${defaultRules.length} default automation rules for client ${clientId}`,
  );
};

logger.info("Automation Engine initialized");

// Export types for use in other modules
export type { AutomationExecution, ActionExecution, AutomationStats };
