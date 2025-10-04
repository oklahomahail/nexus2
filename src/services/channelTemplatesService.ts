// src/services/channelTemplatesService.ts

import type { ChannelTemplate, ChannelType } from "@/models/channels";
import { logger } from "@/utils/logger";

// Template Categories
export const TEMPLATE_CATEGORIES = {
  fundraising: {
    name: "Fundraising",
    description: "Templates for donation and fundraising campaigns",
    color: "#10B981",
    icon: "💰",
  },
  awareness: {
    name: "Awareness",
    description: "Templates for building awareness and education",
    color: "#3B82F6",
    icon: "📢",
  },
  events: {
    name: "Events",
    description: "Templates for event promotion and registration",
    color: "#8B5CF6",
    icon: "🎉",
  },
  stewardship: {
    name: "Stewardship",
    description: "Templates for donor stewardship and thank you messages",
    color: "#F59E0B",
    icon: "🙏",
  },
  newsletters: {
    name: "Newsletters",
    description: "Templates for regular communications and updates",
    color: "#EF4444",
    icon: "📰",
  },
  seasonal: {
    name: "Seasonal",
    description: "Templates for holidays and seasonal campaigns",
    color: "#84CC16",
    icon: "🎊",
  },
} as const;

export type TemplateCategoryKey = keyof typeof TEMPLATE_CATEGORIES;

// Template Storage
class TemplateLibrary {
  private static instance: TemplateLibrary;
  private templates: Map<string, ChannelTemplate> = new Map();

  private constructor() {
    this.initializeDefaultTemplates();
  }

  static getInstance(): TemplateLibrary {
    if (!TemplateLibrary.instance) {
      TemplateLibrary.instance = new TemplateLibrary();
    }
    return TemplateLibrary.instance;
  }

  // Template CRUD Operations
  addTemplate(template: ChannelTemplate): void {
    this.templates.set(template.id, template);
    logger.info(`Template added: ${template.name}`, {
      templateId: template.id,
    });
  }

  getTemplate(id: string): ChannelTemplate | null {
    return this.templates.get(id) || null;
  }

  getAllTemplates(filters?: {
    type?: ChannelType;
    category?: string;
    isPublic?: boolean;
    clientId?: string;
  }): ChannelTemplate[] {
    let templates = Array.from(this.templates.values());

    if (filters) {
      if (filters.type) {
        templates = templates.filter((t) => t.type === filters.type);
      }
      if (filters.category) {
        templates = templates.filter((t) => t.category === filters.category);
      }
      if (filters.isPublic !== undefined) {
        templates = templates.filter(
          (t) => t.config.isPublic === filters.isPublic,
        );
      }
      if (filters.clientId) {
        templates = templates.filter(
          (t) => t.config.isPublic || t.clientId === filters.clientId,
        );
      }
    }

    return templates.sort((a, b) => {
      // Sort by usage (most used first), then by rating, then by name
      if (a.usage.timesUsed !== b.usage.timesUsed) {
        return b.usage.timesUsed - a.usage.timesUsed;
      }
      if ((a.usage.rating || 0) !== (b.usage.rating || 0)) {
        return (b.usage.rating || 0) - (a.usage.rating || 0);
      }
      return a.name.localeCompare(b.name);
    });
  }

  updateTemplate(id: string, updates: Partial<ChannelTemplate>): boolean {
    const existing = this.templates.get(id);
    if (!existing) return false;

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.templates.set(id, updated);

    logger.info(`Template updated: ${updated.name}`, { templateId: id });
    return true;
  }

  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    if (deleted) {
      logger.info(`Template deleted`, { templateId: id });
    }
    return deleted;
  }

  useTemplate(id: string): ChannelTemplate | null {
    const template = this.templates.get(id);
    if (!template) return null;

    // Update usage statistics
    template.usage.timesUsed++;
    template.updatedAt = new Date();

    logger.info(`Template used: ${template.name}`, { templateId: id });
    return template;
  }

  // Search and Discovery
  searchTemplates(
    query: string,
    filters?: {
      type?: ChannelType;
      category?: string;
      clientId?: string;
    },
  ): ChannelTemplate[] {
    const searchTerm = query.toLowerCase();
    const allTemplates = this.getAllTemplates(filters);

    return allTemplates.filter((template) => {
      const searchableText = [
        template.name,
        template.description || "",
        ...template.config.tags,
        template.category,
        template.content.subject || "",
        template.content.message || "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }

  getTemplatesByCategory(
    category: string,
    type?: ChannelType,
  ): ChannelTemplate[] {
    return this.getAllTemplates({ category, type });
  }

  getPopularTemplates(
    limit: number = 10,
    type?: ChannelType,
  ): ChannelTemplate[] {
    const templates = this.getAllTemplates({ type });
    return templates
      .sort((a, b) => b.usage.timesUsed - a.usage.timesUsed)
      .slice(0, limit);
  }

  getTopRatedTemplates(
    limit: number = 10,
    type?: ChannelType,
  ): ChannelTemplate[] {
    const templates = this.getAllTemplates({ type }).filter(
      (t) => t.usage.rating && t.usage.rating > 0,
    );

    return templates
      .sort((a, b) => (b.usage.rating || 0) - (a.usage.rating || 0))
      .slice(0, limit);
  }

  // Template Customization
  customizeTemplate(
    templateId: string,
    customizations: {
      name?: string;
      subject?: string;
      content?: string;
      message?: string;
      hashtags?: string[];
      colors?: Record<string, string>;
      fonts?: Record<string, string>;
    },
  ): ChannelTemplate | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    const customized: ChannelTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
      name: customizations.name || `${template.name} (Custom)`,
      content: {
        ...template.content,
        ...(customizations.subject && { subject: customizations.subject }),
        ...(customizations.content && { htmlContent: customizations.content }),
        ...(customizations.message && { message: customizations.message }),
      },
      config: {
        ...template.config,
        isPublic: false,
        customFields: {
          ...template.config.customFields,
          ...(customizations.hashtags && { hashtags: customizations.hashtags }),
          ...(customizations.colors && { colors: customizations.colors }),
          ...(customizations.fonts && { fonts: customizations.fonts }),
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      usage: {
        timesUsed: 0,
      },
    };

    this.addTemplate(customized);
    return customized;
  }

  // Initialize Default Templates
  private initializeDefaultTemplates(): void {
    const defaultTemplates: ChannelTemplate[] = [
      // Email Templates
      {
        id: "email_annual_fund_appeal",
        name: "Annual Fund Appeal",
        description: "Professional annual fund appeal email template",
        type: "email",
        category: "fundraising",
        content: {
          subject: "Your Support Powers Our Mission - Annual Fund {{year}}",
          htmlContent: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                <img src="{{organization_logo}}" alt="{{organization_name}}" style="max-width: 200px; height: auto;">
              </div>
              
              <div style="padding: 30px 20px;">
                <h1 style="color: #2c5aa0; font-size: 28px; margin-bottom: 20px;">
                  Dear {{first_name}},
                </h1>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  As we reflect on this year's accomplishments, we're reminded that none of our success 
                  would be possible without supporters like you.
                </p>
                
                <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #1976d2; font-size: 20px; margin-bottom: 15px;">
                    This Year's Impact
                  </h2>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">{{impact_stat_1}}</li>
                    <li style="margin-bottom: 10px;">{{impact_stat_2}}</li>
                    <li style="margin-bottom: 10px;">{{impact_stat_3}}</li>
                  </ul>
                </div>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                  Your previous gift of ${last_donation_amount} helped make this possible.
                  Will you consider making a gift to our {{year}} Annual Fund today?
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{donation_link}}" style="background-color: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px; display: inline-block;">
                    Make a Gift Today
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Thank you for being part of our community.<br>
                  With gratitude,<br>
                  <strong>{{signer_name}}</strong><br>
                  {{signer_title}}
                </p>
              </div>
              
              <div style="background-color: #f5f5f5; padding: 15px; font-size: 12px; color: #666; text-align: center;">
                <p>{{organization_name}} | {{organization_address}}</p>
                <p>Tax ID: {{tax_id}} | <a href="{{unsubscribe_link}}">Unsubscribe</a></p>
              </div>
            </div>
          `,
          textContent: `Dear {{first_name}},

As we reflect on this year's accomplishments, we're reminded that none of our success would be possible without supporters like you.

This Year's Impact:
- {{impact_stat_1}}
- {{impact_stat_2}}  
- {{impact_stat_3}}

Your previous gift of ${last_donation_amount} helped make this possible. Will you consider making a gift to our {year} Annual Fund today?

Make a gift online: {{donation_link}}

Thank you for being part of our community.

With gratitude,
{{signer_name}}
{{signer_title}}

{{organization_name}} | {{organization_address}}
Tax ID: {{tax_id}} | Unsubscribe: {{unsubscribe_link}}`,
        },
        config: {
          isPublic: true,
          tags: ["annual fund", "appeal", "donation", "impact"],
          difficulty: "intermediate",
          estimatedSetupTime: 20,
          previewImage: "/templates/email/annual-fund-preview.png",
        },
        usage: {
          timesUsed: 847,
          rating: 4.7,
          reviews: 23,
        },
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        createdBy: "system",
      },

      {
        id: "email_thank_you_receipt",
        name: "Donation Thank You & Receipt",
        description: "Professional thank you email with tax receipt",
        type: "email",
        category: "stewardship",
        content: {
          subject: "Thank you for your gift of ${{donation_amount}}!",
          htmlContent: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <div style="background-color: #4caf50; padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 32px;">Thank You!</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px;">Your generosity makes a difference</p>
              </div>
              
              <div style="padding: 30px 20px;">
                <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">
                  Dear {{donor_first_name}},
                </h2>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  We are incredibly grateful for your generous gift of <strong>${donation_amount}</strong>
                  to {{campaign_name}}. Your support directly impacts our ability to {{mission_statement}}.
                </p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4caf50;">
                  <h3 style="margin: 0 0 15px 0; color: #2e7d32;">Donation Details</h3>
                  <table style="width: 100%; font-size: 14px;">
                    <tr>
                      <td style="padding: 5px 0;"><strong>Date:</strong></td>
                      <td style="padding: 5px 0;">{{donation_date}}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0;"><strong>Amount:</strong></td>
                      <td style="padding: 5px 0;">${donation_amount}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0;"><strong>Method:</strong></td>
                      <td style="padding: 5px 0;">{{payment_method}}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0;"><strong>Receipt #:</strong></td>
                      <td style="padding: 5px 0;">{{receipt_number}}</td>
                    </tr>
                  </table>
                </div>
                
                <p style="font-size: 14px; color: #666; margin: 20px 0;">
                  <strong>Tax Information:</strong> This donation is tax-deductible to the fullest extent allowed by law. 
                  {{organization_name}} is a 501(c)(3) nonprofit organization, Tax ID: {{tax_id}}. 
                  No goods or services were provided in exchange for this donation.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{receipt_download_link}}" style="background-color: #1976d2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                    Download Receipt PDF
                  </a>
                </div>
                
                <p style="font-size: 16px; line-height: 1.6; margin-top: 25px;">
                  We'll keep you updated on how your gift is making an impact. Thank you for believing in our mission!
                </p>
                
                <p style="margin-top: 30px;">
                  Gratefully,<br>
                  <strong>{{signer_name}}</strong><br>
                  {{signer_title}}
                </p>
              </div>
            </div>
          `,
        },
        config: {
          isPublic: true,
          tags: ["thank you", "receipt", "stewardship", "tax deductible"],
          difficulty: "beginner",
          estimatedSetupTime: 10,
        },
        usage: {
          timesUsed: 1243,
          rating: 4.9,
          reviews: 67,
        },
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10"),
        createdBy: "system",
      },

      // Social Media Templates
      {
        id: "social_donation_drive",
        name: "Donation Drive Announcement",
        description: "Engaging social media post for donation drives",
        type: "social_media",
        category: "fundraising",
        content: {
          message: `🎯 GOAL: ${goal_amount} by {end_date}

We're {{progress_percentage}}% of the way to our goal! Every donation, no matter the size, brings us closer to {{campaign_purpose}}.

✨ Your ${suggested_amount} can:
{{impact_description}}

Join {{donor_count}} supporters who've already given. Will you be next?

👇 Donate now: {{donation_link}}

{{hashtags}}`,
          customFields: {
            suggestedHashtags: [
              "#nonprofit",
              "#donate",
              "#fundraising",
              "#community",
              "#impact",
              "#charity",
            ],
            platforms: ["facebook", "twitter", "instagram", "linkedin"],
          },
        },
        config: {
          isPublic: true,
          tags: ["donation drive", "fundraising", "goal", "social proof"],
          difficulty: "beginner",
          estimatedSetupTime: 5,
        },
        usage: {
          timesUsed: 567,
          rating: 4.5,
          reviews: 12,
        },
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
        createdBy: "system",
      },

      {
        id: "social_impact_story",
        name: "Impact Story Share",
        description: "Heartwarming story template highlighting program impact",
        type: "social_media",
        category: "stewardship",
        content: {
          message: `💫 IMPACT STORY 💫

Meet {{beneficiary_name}}: {{brief_story}}

"{{testimonial_quote}}" - {{beneficiary_name}}

This is what YOUR support makes possible. Thank you to everyone who helps us {{mission_action}}.

Want to create more stories like this? Learn how: {{learn_more_link}}

{{hashtags}}`,
          customFields: {
            suggestedHashtags: [
              "#impact",
              "#nonprofit",
              "#community",
              "#thankyou",
              "#stories",
            ],
            includePhoto: true,
            platforms: ["facebook", "instagram", "linkedin"],
          },
        },
        config: {
          isPublic: true,
          tags: ["impact", "story", "testimonial", "stewardship"],
          difficulty: "beginner",
          estimatedSetupTime: 8,
        },
        usage: {
          timesUsed: 423,
          rating: 4.8,
          reviews: 19,
        },
        createdAt: new Date("2024-02-15"),
        updatedAt: new Date("2024-02-15"),
        createdBy: "system",
      },

      // Event Templates
      {
        id: "email_event_invitation",
        name: "Formal Event Invitation",
        description: "Elegant invitation template for galas and formal events",
        type: "email",
        category: "events",
        content: {
          subject: "You're Invited: {{event_name}} - {{event_date}}",
          htmlContent: `
            <div style="max-width: 650px; margin: 0 auto; font-family: Georgia, serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <div style="padding: 40px 30px; text-align: center; color: white;">
                <h1 style="font-size: 36px; margin: 0 0 10px 0; font-weight: normal; letter-spacing: 2px;">
                  You're Invited
                </h1>
                <div style="width: 60px; height: 2px; background: white; margin: 20px auto;"></div>
                <h2 style="font-size: 24px; margin: 20px 0 0 0; font-weight: normal;">
                  {{event_name}}
                </h2>
              </div>
              
              <div style="background: white; padding: 40px 30px;">
                <p style="font-size: 18px; line-height: 1.6; color: #333; margin-bottom: 25px; text-align: center;">
                  Dear {{guest_name}},
                </p>
                
                <p style="font-size: 16px; line-height: 1.7; color: #555; margin-bottom: 25px;">
                  {{organization_name}} cordially invites you to join us for an evening of 
                  {{event_description}}. This special event supports our mission to {{mission_brief}}.
                </p>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
                  <div style="display: inline-block; text-align: left;">
                    <p style="margin: 5px 0; color: #333;"><strong>📅 Date:</strong> {{event_date}}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>🕕 Time:</strong> {{event_time}}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>📍 Location:</strong> {{event_venue}}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>👔 Attire:</strong> {{dress_code}}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>🎟️ Investment:</strong> {{ticket_price}}</p>
                  </div>
                </div>
                
                <p style="font-size: 16px; line-height: 1.7; color: #555; margin-bottom: 30px;">
                  The evening will feature {{event_highlights}}. All proceeds benefit {{beneficiary_description}}.
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <a href="{{registration_link}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 50px; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                    Reserve Your Seat
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                  RSVP by {{rsvp_deadline}} • Limited seating available
                </p>
                
                <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="font-size: 16px; color: #333; margin: 0;">
                    With warm regards,<br>
                    <strong>{{host_name}}</strong><br>
                    <em>{{host_title}}</em>
                  </p>
                </div>
              </div>
            </div>
          `,
        },
        config: {
          isPublic: true,
          tags: ["event", "gala", "invitation", "formal", "fundraising"],
          difficulty: "intermediate",
          estimatedSetupTime: 25,
        },
        usage: {
          timesUsed: 234,
          rating: 4.6,
          reviews: 8,
        },
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-03-01"),
        createdBy: "system",
      },

      // Direct Mail Templates
      {
        id: "direct_mail_annual_appeal",
        name: "Annual Appeal Letter",
        description: "Professional direct mail appeal letter template",
        type: "direct_mail",
        category: "fundraising",
        content: {
          subject: "Annual Appeal {{year}} - {{organization_name}}",
          message: `Dear {{salutation}} {{last_name}},

As we approach the end of another impactful year, I'm writing to share some remarkable achievements and to invite you to be part of our continued success.

Thanks to supporters like you, we've accomplished:
• {{impact_stat_1}}
• {{impact_stat_2}}
• {{impact_stat_3}}

Your previous gift of ${last_donation_amount} was instrumental in making these results possible. Today, I'm asking you to consider a gift of ${suggested_amount} to our {year} Annual Fund.

Your investment will directly support:
{{impact_description}}

{{personal_story}}

Every gift matters, and every dollar goes directly to our mission. Will you join us in making an even greater impact in the year ahead?

To make your gift, simply complete the enclosed reply card and return it in the postage-paid envelope, or visit us online at {{donation_website}}.

Thank you for your continued partnership in our work.

With deep gratitude,

{{signer_name}}
{{signer_title}}
{{organization_name}}

P.S. {{postscript_message}}`,
          customFields: {
            printSpecs: {
              paperSize: "8.5x11",
              paperWeight: "24lb",
              colors: 2,
              folds: "tri-fold",
            },
            addressValidation: true,
            estimatedCostPer1000: 850,
            minQuantity: 500,
          },
        },
        config: {
          isPublic: true,
          tags: [
            "annual fund",
            "direct mail",
            "appeal",
            "fundraising",
            "print",
          ],
          difficulty: "intermediate",
          estimatedSetupTime: 30,
          previewImage: "/templates/direct_mail/annual-appeal-preview.png",
        },
        usage: {
          timesUsed: 156,
          rating: 4.3,
          reviews: 9,
        },
        createdAt: new Date("2024-01-25"),
        updatedAt: new Date("2024-01-25"),
        createdBy: "system",
      },

      {
        id: "direct_mail_thank_you_card",
        name: "Thank You Card",
        description: "Elegant thank you card for donors",
        type: "direct_mail",
        category: "stewardship",
        content: {
          subject: "Thank You Card - {{donor_name}}",
          message: `Dear {{donor_first_name}},

Thank you!

Your generous gift of ${donation_amount} means so much to our work and the people we serve.

{{brief_impact_message}}

With heartfelt appreciation,
{{signer_name}}
{{organization_name}}`,
          customFields: {
            printSpecs: {
              paperSize: "5x7",
              paperWeight: "130lb cardstock",
              colors: 4,
              finish: "matte",
            },
            addressValidation: true,
            estimatedCostPer1000: 1200,
            minQuantity: 250,
          },
        },
        config: {
          isPublic: true,
          tags: ["thank you", "stewardship", "card", "donor relations"],
          difficulty: "beginner",
          estimatedSetupTime: 15,
          previewImage: "/templates/direct_mail/thank-you-card-preview.png",
        },
        usage: {
          timesUsed: 287,
          rating: 4.6,
          reviews: 12,
        },
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date("2024-02-10"),
        createdBy: "system",
      },

      {
        id: "direct_mail_event_invitation",
        name: "Event Invitation Mailer",
        description: "Formal event invitation for direct mail",
        type: "direct_mail",
        category: "events",
        content: {
          subject: "Invitation to {{event_name}} - {{event_date}}",
          message: `{{organization_name}} cordially invites you to

{{event_name}}

{{event_description}}

{{event_date}}
{{event_time}}
{{event_venue}}
{{event_address}}

Join us for an evening of {{event_highlights}}. This special event supports our mission to {{mission_brief}}.

Ticket Investment: {{ticket_price}}
Dress Code: {{dress_code}}

RSVP by {{rsvp_deadline}}
Online: {{registration_website}}
Phone: {{organization_phone}}

We look forward to celebrating with you!

{{host_name}}
{{host_title}}`,
          customFields: {
            printSpecs: {
              paperSize: "6x9",
              paperWeight: "100lb text",
              colors: 4,
              finish: "glossy",
              envelope: "included",
            },
            addressValidation: true,
            estimatedCostPer1000: 1650,
            minQuantity: 100,
          },
        },
        config: {
          isPublic: true,
          tags: ["event", "invitation", "formal", "fundraising", "gala"],
          difficulty: "intermediate",
          estimatedSetupTime: 25,
          previewImage: "/templates/direct_mail/event-invitation-preview.png",
        },
        usage: {
          timesUsed: 89,
          rating: 4.4,
          reviews: 7,
        },
        createdAt: new Date("2024-03-05"),
        updatedAt: new Date("2024-03-05"),
        createdBy: "system",
      },

      // Newsletter Templates
      {
        id: "email_monthly_newsletter",
        name: "Monthly Impact Newsletter",
        description: "Comprehensive newsletter template with impact updates",
        type: "email",
        category: "newsletters",
        content: {
          subject: "{{organization_name}} Impact Update - {{month}} {{year}}",
          htmlContent: `
            <div style="max-width: 680px; margin: 0 auto; font-family: Arial, sans-serif; background: #ffffff;">
              <!-- Header -->
              <div style="background: #2c5aa0; padding: 25px; text-align: center;">
                <img src="{{organization_logo}}" alt="{{organization_name}}" style="max-width: 180px; height: auto;">
                <h1 style="color: white; font-size: 28px; margin: 15px 0 5px 0;">Impact Update</h1>
                <p style="color: #e3f2fd; margin: 0; font-size: 16px;">{{month}} {{year}}</p>
              </div>
              
              <!-- Welcome Message -->
              <div style="padding: 30px 25px;">
                <h2 style="color: #333; font-size: 22px; margin: 0 0 20px 0;">
                  Dear {{first_name}},
                </h2>
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px;">
                  {{welcome_message}}
                </p>
              </div>
              
              <!-- Featured Story -->
              <div style="background: #f8f9fa; padding: 25px; margin: 0 25px; border-radius: 10px;">
                <h3 style="color: #2c5aa0; font-size: 20px; margin: 0 0 15px 0;">🌟 Featured Story</h3>
                <img src="{{featured_story_image}}" alt="Featured Story" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="color: #333; font-size: 18px; margin: 0 0 10px 0;">{{featured_story_title}}</h4>
                <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 15px;">{{featured_story_excerpt}}</p>
                <a href="{{featured_story_link}}" style="color: #2c5aa0; text-decoration: none; font-weight: bold;">Read the full story →</a>
              </div>
              
              <!-- Impact Numbers -->
              <div style="padding: 30px 25px;">
                <h3 style="color: #333; font-size: 20px; margin: 0 0 20px 0; text-align: center;">📊 This Month's Impact</h3>
                <div style="display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 150px; margin: 10px;">
                    <div style="background: #e8f5e8; color: #2e7d32; font-size: 32px; font-weight: bold; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                      {{impact_number_1}}
                    </div>
                    <p style="font-size: 14px; color: #666; margin: 0;">{{impact_description_1}}</p>
                  </div>
                  <div style="flex: 1; min-width: 150px; margin: 10px;">
                    <div style="background: #e3f2fd; color: #1976d2; font-size: 32px; font-weight: bold; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                      {{impact_number_2}}
                    </div>
                    <p style="font-size: 14px; color: #666; margin: 0;">{{impact_description_2}}</p>
                  </div>
                  <div style="flex: 1; min-width: 150px; margin: 10px;">
                    <div style="background: #fff3e0; color: #f57c00; font-size: 32px; font-weight: bold; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                      {{impact_number_3}}
                    </div>
                    <p style="font-size: 14px; color: #666; margin: 0;">{{impact_description_3}}</p>
                  </div>
                </div>
              </div>
              
              <!-- Programs Section -->
              <div style="padding: 0 25px 30px 25px;">
                <h3 style="color: #333; font-size: 20px; margin: 0 0 20px 0;">🎯 Program Highlights</h3>
                
                <div style="border-left: 4px solid #4caf50; padding-left: 20px; margin-bottom: 25px;">
                  <h4 style="color: #2e7d32; font-size: 18px; margin: 0 0 10px 0;">{{program_1_name}}</h4>
                  <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0;">{{program_1_update}}</p>
                </div>
                
                <div style="border-left: 4px solid #2196f3; padding-left: 20px; margin-bottom: 25px;">
                  <h4 style="color: #1976d2; font-size: 18px; margin: 0 0 10px 0;">{{program_2_name}}</h4>
                  <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0;">{{program_2_update}}</p>
                </div>
                
                <div style="border-left: 4px solid #ff9800; padding-left: 20px;">
                  <h4 style="color: #f57c00; font-size: 18px; margin: 0 0 10px 0;">{{program_3_name}}</h4>
                  <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0;">{{program_3_update}}</p>
                </div>
              </div>
              
              <!-- Upcoming Events -->
              <div style="background: #fff3e0; padding: 25px; margin: 0 25px 30px 25px; border-radius: 10px;">
                <h3 style="color: #e65100; font-size: 20px; margin: 0 0 20px 0;">📅 Upcoming Events</h3>
                <div style="margin-bottom: 15px;">
                  <strong style="color: #bf360c;">{{event_1_date}}</strong> - {{event_1_name}}<br>
                  <span style="color: #666; font-size: 14px;">{{event_1_details}}</span>
                </div>
                <div style="margin-bottom: 15px;">
                  <strong style="color: #bf360c;">{{event_2_date}}</strong> - {{event_2_name}}<br>
                  <span style="color: #666; font-size: 14px;">{{event_2_details}}</span>
                </div>
                <a href="{{events_calendar_link}}" style="color: #e65100; text-decoration: none; font-weight: bold;">View full events calendar →</a>
              </div>
              
              <!-- Call to Action -->
              <div style="text-align: center; padding: 30px 25px;">
                <h3 style="color: #333; font-size: 20px; margin: 0 0 20px 0;">💙 Support Our Work</h3>
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px;">
                  Your continued support makes all of this possible. Consider making a gift to help us expand our impact.
                </p>
                <a href="{{donation_link}}" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px; display: inline-block; margin-right: 15px;">
                  Make a Donation
                </a>
                <a href="{{volunteer_link}}" style="background: #2196f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px; display: inline-block;">
                  Volunteer With Us
                </a>
              </div>
              
              <!-- Footer -->
              <div style="background: #263238; color: #b0bec5; padding: 25px; text-align: center;">
                <p style="margin: 0 0 15px 0; font-size: 16px;">Thank you for being part of our community!</p>
                <p style="margin: 0 0 15px 0; font-size: 14px;">
                  {{organization_name}}<br>
                  {{organization_address}}<br>
                  {{organization_phone}} | {{organization_email}}
                </p>
                <div style="margin: 20px 0;">
                  <a href="{{facebook_link}}" style="color: #81c784; text-decoration: none; margin: 0 10px;">Facebook</a>
                  <a href="{{twitter_link}}" style="color: #81c784; text-decoration: none; margin: 0 10px;">Twitter</a>
                  <a href="{{instagram_link}}" style="color: #81c784; text-decoration: none; margin: 0 10px;">Instagram</a>
                  <a href="{{linkedin_link}}" style="color: #81c784; text-decoration: none; margin: 0 10px;">LinkedIn</a>
                </div>
                <p style="margin: 0; font-size: 12px;">
                  <a href="{{unsubscribe_link}}" style="color: #78909c;">Unsubscribe</a> | 
                  <a href="{{preferences_link}}" style="color: #78909c;">Update Preferences</a>
                </p>
              </div>
            </div>
          `,
        },
        config: {
          isPublic: true,
          tags: ["newsletter", "monthly", "impact", "updates", "comprehensive"],
          difficulty: "advanced",
          estimatedSetupTime: 45,
        },
        usage: {
          timesUsed: 189,
          rating: 4.4,
          reviews: 15,
        },
        createdAt: new Date("2024-02-20"),
        updatedAt: new Date("2024-02-20"),
        createdBy: "system",
      },
    ];

    defaultTemplates.forEach((template) => {
      this.addTemplate(template);
    });

    logger.info(`Initialized ${defaultTemplates.length} default templates`);
  }
}

// Service Functions (Public API)
const templateLibrary = TemplateLibrary.getInstance();

export const getAllTemplates = (filters?: {
  type?: ChannelType;
  category?: string;
  isPublic?: boolean;
  clientId?: string;
}): ChannelTemplate[] => {
  return templateLibrary.getAllTemplates(filters);
};

export const getTemplate = (id: string): ChannelTemplate | null => {
  return templateLibrary.getTemplate(id);
};

export const createTemplate = (template: ChannelTemplate): void => {
  templateLibrary.addTemplate(template);
};

export const updateTemplate = (
  id: string,
  updates: Partial<ChannelTemplate>,
): boolean => {
  return templateLibrary.updateTemplate(id, updates);
};

export const deleteTemplate = (id: string): boolean => {
  return templateLibrary.deleteTemplate(id);
};

export const useTemplate = (id: string): ChannelTemplate | null => {
  return templateLibrary.useTemplate(id);
};

export const searchTemplates = (
  query: string,
  filters?: {
    type?: ChannelType;
    category?: string;
    clientId?: string;
  },
): ChannelTemplate[] => {
  return templateLibrary.searchTemplates(query, filters);
};

export const getTemplatesByCategory = (
  category: string,
  type?: ChannelType,
): ChannelTemplate[] => {
  return templateLibrary.getTemplatesByCategory(category, type);
};

export const getPopularTemplates = (
  limit?: number,
  type?: ChannelType,
): ChannelTemplate[] => {
  return templateLibrary.getPopularTemplates(limit, type);
};

export const getTopRatedTemplates = (
  limit?: number,
  type?: ChannelType,
): ChannelTemplate[] => {
  return templateLibrary.getTopRatedTemplates(limit, type);
};

export const customizeTemplate = (
  templateId: string,
  customizations: {
    name?: string;
    subject?: string;
    content?: string;
    message?: string;
    hashtags?: string[];
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
  },
): ChannelTemplate | null => {
  return templateLibrary.customizeTemplate(templateId, customizations);
};

// Template Statistics
export const getTemplateStatistics = (): {
  totalTemplates: number;
  templatesByType: Record<ChannelType, number>;
  templatesByCategory: Record<string, number>;
  mostPopularTemplate: ChannelTemplate | null;
  highestRatedTemplate: ChannelTemplate | null;
  totalUsage: number;
} => {
  const allTemplates = getAllTemplates();

  const templatesByType = allTemplates.reduce(
    (acc, template) => {
      acc[template.type] = (acc[template.type] || 0) + 1;
      return acc;
    },
    {} as Record<ChannelType, number>,
  );

  const templatesByCategory = allTemplates.reduce(
    (acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostPopularTemplate =
    allTemplates.sort((a, b) => b.usage.timesUsed - a.usage.timesUsed)[0] ||
    null;

  const highestRatedTemplate =
    allTemplates
      .filter((t) => t.usage.rating && t.usage.rating > 0)
      .sort((a, b) => (b.usage.rating || 0) - (a.usage.rating || 0))[0] || null;

  const totalUsage = allTemplates.reduce(
    (sum, template) => sum + template.usage.timesUsed,
    0,
  );

  return {
    totalTemplates: allTemplates.length,
    templatesByType,
    templatesByCategory,
    mostPopularTemplate,
    highestRatedTemplate,
    totalUsage,
  };
};

logger.info("Channel Templates Service initialized");
