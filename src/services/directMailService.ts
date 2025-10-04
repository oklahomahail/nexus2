// src/services/directMailService.ts

import type { DirectMailCampaign, ChannelTemplate } from "@/models/channels";
import { logger } from "@/utils/logger";

// Address Validation Interface
export interface AddressValidationResult {
  isValid: boolean;
  standardizedAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    plus4?: string;
  };
  deliveryConfidence: "high" | "medium" | "low";
  errors?: string[];
  suggestions?: string[];
}

// Print Specifications
export interface PrintSpecs {
  paperSize: string;
  paperWeight: string;
  colors: number;
  finish?: string;
  folds?: string;
  envelope?: string;
  binding?: string;
}

// Cost Calculation Interface
export interface CostBreakdown {
  printing: number;
  postage: number;
  design: number;
  addressValidation: number;
  handling: number;
  total: number;
  perPiece: number;
}

// Direct Mail Providers
const ____PRINT_PROVIDERS = {
  "print-partner-1": {
    name: "Professional Print Solutions",
    minimums: { postcards: 500, letters: 250, brochures: 1000 },
    turnaround: { rush: 3, standard: 7, economy: 14 },
    costMultipliers: { rush: 1.8, standard: 1.0, economy: 0.8 },
  },
  "print-partner-2": {
    name: "Direct Mail Express",
    minimums: { postcards: 250, letters: 100, brochures: 500 },
    turnaround: { rush: 2, standard: 5, economy: 10 },
    costMultipliers: { rush: 2.2, standard: 1.2, economy: 0.9 },
  },
} as const;

// USPS Postage Rates (2024 estimates)
const POSTAGE_RATES = {
  "First-Class Mail": {
    letter: 0.68,
    large_envelope: 1.4,
    postcard: 0.53,
  },
  "USPS Marketing Mail": {
    letter: 0.395,
    large_envelope: 0.75,
    postcard: 0.36,
  },
} as const;

class DirectMailService {
  private static instance: DirectMailService;

  private constructor() {
    logger.info("Direct Mail Service initialized");
  }

  static getInstance(): DirectMailService {
    if (!DirectMailService.instance) {
      DirectMailService.instance = new DirectMailService();
    }
    return DirectMailService.instance;
  }

  // Address Validation
  async validateAddress(address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }): Promise<AddressValidationResult> {
    try {
      // Simulate USPS Address Validation API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock validation logic
      const mockValidation: AddressValidationResult = {
        isValid: true,
        standardizedAddress: {
          street: address.street.toUpperCase(),
          city: address.city.toUpperCase(),
          state: address.state.toUpperCase(),
          zipCode: address.zipCode.replace(/\D/g, "").slice(0, 5),
          plus4: Math.random() > 0.5 ? "1234" : undefined,
        },
        deliveryConfidence:
          Math.random() > 0.8 ? "high" : Math.random() > 0.5 ? "medium" : "low",
      };

      // Add some realistic validation scenarios
      if (
        address.street.toLowerCase().includes("po box") ||
        address.street.toLowerCase().includes("p.o. box")
      ) {
        mockValidation.suggestions = [
          "Consider using street address for better deliverability",
        ];
      }

      if (address.zipCode.length < 5) {
        mockValidation.isValid = false;
        mockValidation.errors = ["ZIP code must be at least 5 digits"];
      }

      logger.info("Address validated", {
        address: mockValidation.standardizedAddress,
      });
      return mockValidation;
    } catch (error) {
      logger.error("Address validation failed", { error, address });
      return {
        isValid: false,
        deliveryConfidence: "low",
        errors: ["Address validation service unavailable"],
      };
    }
  }

  // Batch Address Validation
  async validateAddressBatch(
    addresses: Array<{
      id: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
    }>,
  ): Promise<Map<string, AddressValidationResult>> {
    const results = new Map<string, AddressValidationResult>();

    logger.info(`Validating batch of ${addresses.length} addresses`);

    // Process in chunks to avoid overwhelming the service
    const chunkSize = 100;
    for (let i = 0; i < addresses.length; i += chunkSize) {
      const chunk = addresses.slice(i, i + chunkSize);

      const chunkResults = await Promise.all(
        chunk.map(async (addr) => ({
          id: addr.id,
          result: await this.validateAddress(addr),
        })),
      );

      chunkResults.forEach(({ id, result }) => {
        results.set(id, result);
      });

      // Small delay between chunks
      if (i + chunkSize < addresses.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const validCount = Array.from(results.values()).filter(
      (r) => r.isValid,
    ).length;
    logger.info(
      `Batch validation complete: ${validCount}/${addresses.length} valid addresses`,
    );

    return results;
  }

  // Cost Calculation
  calculateCosts(campaign: DirectMailCampaign): CostBreakdown {
    const quantity = campaign.audience?.totalRecipients || 1000;
    const printSpecs = campaign.content?.customFields?.printSpecs as PrintSpecs;

    // Base printing costs
    let printingCost = 0;
    if (printSpecs) {
      const baseCost =
        printSpecs.paperSize === "5x7"
          ? 0.45
          : printSpecs.paperSize === "6x9"
            ? 0.65
            : 0.35;

      const colorMultiplier =
        printSpecs.colors === 4 ? 1.5 : printSpecs.colors === 2 ? 1.2 : 1.0;

      printingCost = quantity * baseCost * colorMultiplier;
    } else {
      printingCost = quantity * 0.35; // Default letter cost
    }

    // Postage calculation
    const mailType =
      quantity > 5000 ? "USPS Marketing Mail" : "First-Class Mail";
    const pieceType =
      printSpecs?.paperSize === "5x7" || printSpecs?.paperSize === "6x9"
        ? "postcard"
        : "letter";

    const postageRate = POSTAGE_RATES[mailType][pieceType] || 0.68;
    const postageCost = quantity * postageRate;

    // Additional costs
    const designCost = campaign.content?.customFields?.designIncluded ? 0 : 500;
    const addressValidationCost = quantity * 0.02; // 2¢ per address
    const handlingCost = quantity * 0.05; // 5¢ per piece handling

    const total =
      printingCost +
      postageCost +
      designCost +
      addressValidationCost +
      handlingCost;

    const breakdown: CostBreakdown = {
      printing: Math.round(printingCost * 100) / 100,
      postage: Math.round(postageCost * 100) / 100,
      design: designCost,
      addressValidation: Math.round(addressValidationCost * 100) / 100,
      handling: Math.round(handlingCost * 100) / 100,
      total: Math.round(total * 100) / 100,
      perPiece: Math.round((total / quantity) * 100) / 100,
    };

    logger.info("Direct mail costs calculated", {
      campaignId: campaign.id,
      breakdown,
      quantity,
    });
    return breakdown;
  }

  // Print-Ready File Generation
  async generatePrintFiles(campaign: DirectMailCampaign): Promise<{
    designFile: string;
    proofFile: string;
    specs: PrintSpecs;
    instructions: string[];
  }> {
    logger.info(`Generating print files for campaign: ${campaign.name}`);

    // Simulate file generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const printSpecs = (campaign.content?.customFields
      ?.printSpecs as PrintSpecs) || {
      paperSize: "8.5x11",
      paperWeight: "24lb",
      colors: 2,
    };

    const mockFiles = {
      designFile: `/generated/campaigns/${campaign.id}/design_print_ready.pdf`,
      proofFile: `/generated/campaigns/${campaign.id}/proof.pdf`,
      specs: printSpecs,
      instructions: [
        `Print on ${printSpecs.paperSize} ${printSpecs.paperWeight} paper`,
        `${printSpecs.colors} color printing`,
        printSpecs.finish ? `Apply ${printSpecs.finish} finish` : "",
        printSpecs.folds ? `Apply ${printSpecs.folds} folding` : "",
        "Include postage-paid return envelope if applicable",
        "Verify color accuracy with provided proof",
      ].filter(Boolean),
    };

    logger.info("Print files generated", {
      campaignId: campaign.id,
      files: mockFiles,
    });
    return mockFiles;
  }

  // Mailing List Preparation
  async prepareMalingList(campaign: DirectMailCampaign): Promise<{
    totalRecords: number;
    validAddresses: number;
    invalidAddresses: number;
    duplicatesRemoved: number;
    mailFile: string;
    suppressionApplied: boolean;
  }> {
    logger.info(`Preparing mailing list for campaign: ${campaign.name}`);

    const totalRecords = campaign.audience?.totalRecipients || 0;

    // Simulate list processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock processing results
    const duplicatesRemoved = Math.floor(totalRecords * 0.03); // 3% duplicates
    const invalidAddresses = Math.floor(totalRecords * 0.08); // 8% invalid
    const validAddresses = totalRecords - duplicatesRemoved - invalidAddresses;

    const result = {
      totalRecords,
      validAddresses,
      invalidAddresses,
      duplicatesRemoved,
      mailFile: `/generated/campaigns/${campaign.id}/mailing_list_final.csv`,
      suppressionApplied: true,
    };

    logger.info("Mailing list prepared", { campaignId: campaign.id, result });
    return result;
  }

  // Campaign Status Tracking
  async trackCampaignStatus(campaignId: string): Promise<{
    status:
      | "draft"
      | "proofing"
      | "approved"
      | "printing"
      | "mailing"
      | "in_mail"
      | "delivered";
    progress: number;
    estimatedDelivery?: Date;
    tracking?: {
      printed: number;
      mailed: number;
      delivered: number;
      returned: number;
    };
  }> {
    // Simulate tracking data
    const mockStatuses = [
      "draft",
      "proofing",
      "approved",
      "printing",
      "mailing",
      "in_mail",
      "delivered",
    ] as const;
    const currentStatusIndex = Math.floor(Math.random() * mockStatuses.length);
    const status = mockStatuses[currentStatusIndex];

    const progress = ((currentStatusIndex + 1) / mockStatuses.length) * 100;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(
      estimatedDelivery.getDate() + (7 - currentStatusIndex),
    );

    const result = {
      status,
      progress: Math.round(progress),
      estimatedDelivery,
      tracking:
        status === "delivered"
          ? {
              printed: 1000,
              mailed: 1000,
              delivered: 920,
              returned: 35,
            }
          : undefined,
    };

    logger.info("Campaign status tracked", { campaignId, result });
    return result;
  }

  // Response Tracking
  async trackResponses(campaignId: string): Promise<{
    responseRate: number;
    totalResponses: number;
    donationResponses: number;
    totalRaised: number;
    avgGiftSize: number;
    responsesByDay: Array<{
      date: string;
      responses: number;
      donations: number;
      amount: number;
    }>;
  }> {
    // Simulate response tracking
    const totalMailed = 1000;
    const responseRate = 0.035 + Math.random() * 0.015; // 3.5-5% response rate
    const totalResponses = Math.floor(totalMailed * responseRate);
    const donationResponses = Math.floor(totalResponses * 0.8); // 80% of responses include donation

    const avgGiftSize = 125 + Math.random() * 100; // $125-225 average
    const totalRaised = donationResponses * avgGiftSize;

    // Generate daily response data for last 30 days
    const responsesByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));

      const dailyResponses = Math.floor(Math.random() * (totalResponses / 15));
      const dailyDonations = Math.floor(dailyResponses * 0.8);
      const dailyAmount =
        dailyDonations * (avgGiftSize + (Math.random() - 0.5) * 50);

      return {
        date: date.toISOString().split("T")[0],
        responses: dailyResponses,
        donations: dailyDonations,
        amount: Math.round(dailyAmount * 100) / 100,
      };
    });

    const result = {
      responseRate: Math.round(responseRate * 1000) / 10, // Convert to percentage with 1 decimal
      totalResponses,
      donationResponses,
      totalRaised: Math.round(totalRaised * 100) / 100,
      avgGiftSize: Math.round(avgGiftSize * 100) / 100,
      responsesByDay,
    };

    logger.info("Campaign responses tracked", { campaignId, result });
    return result;
  }

  // Template Specific Functions
  generateTemplatePreview(
    template: ChannelTemplate,
    data: Record<string, any> = {},
  ): string {
    if (template.type !== "direct_mail") {
      throw new Error("Template is not a direct mail template");
    }

    let preview = template.content.message || "";

    // Replace template variables with sample data
    const sampleData = {
      salutation: "Mr.",
      last_name: "Johnson",
      first_name: "Robert",
      organization_name: "Hope Foundation",
      year: new Date().getFullYear().toString(),
      impact_stat_1: "Served 1,200 families in our community",
      impact_stat_2: "Provided scholarships to 45 students",
      impact_stat_3: "Built 3 new community centers",
      last_donation_amount: "150",
      suggested_amount: "200",
      donation_website: "www.hopefoundation.org/donate",
      signer_name: "Sarah Mitchell",
      signer_title: "Executive Director",
      postscript_message:
        "Your support this year will help us reach even more families in need.",
      ...data,
    };

    // Replace template variables
    Object.entries(sampleData).forEach(([key, value]) => {
      const pattern = new RegExp(`{{${key}}}`, "g");
      preview = preview.replace(pattern, value);
    });

    return preview;
  }
}

// Export service instance
export const directMailService = DirectMailService.getInstance();

// Export utility functions
export const validateSingleAddress = (address: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}): Promise<AddressValidationResult> => {
  return directMailService.validateAddress(address);
};

export const calculateDirectMailCosts = (
  campaign: DirectMailCampaign,
): CostBreakdown => {
  return directMailService.calculateCosts(campaign);
};

export const preparePrintFiles = (campaign: DirectMailCampaign) => {
  return directMailService.generatePrintFiles(campaign);
};

export const getDirectMailStatus = (campaignId: string) => {
  return directMailService.trackCampaignStatus(campaignId);
};

export const getDirectMailResponses = (campaignId: string) => {
  return directMailService.trackResponses(campaignId);
};

logger.info("Direct Mail Service exports ready");
