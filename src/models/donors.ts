// src/models/donors.ts

export interface Donation {
  id: string;
  amount: number;
  date: Date;
  campaignId?: string;
  method: "credit_card" | "bank_transfer" | "check" | "cash" | "crypto";
  recurring: boolean;
  source: "website" | "direct_mail" | "email" | "phone" | "event" | "referral";
  metadata?: Record<string, any>;
}

export interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  age?: number;
  dateCreated: Date;
  lastContact?: Date;
  totalDonated: number;
  donationCount: number;
  averageDonation: number;
  lastDonationDate?: Date;
  firstDonationDate?: Date;
  donations: Donation[];
  preferences: {
    communicationChannel: "email" | "phone" | "mail" | "text";
    frequency: "daily" | "weekly" | "monthly" | "quarterly";
    topics: string[];
    emailOptIn: boolean;
    smsOptIn: boolean;
    mailingListOptIn: boolean;
  };
  segments: string[];
  tags: string[];
  customFields: Record<string, any>;
  engagementScore: number;
  churnRisk: "low" | "medium" | "high";
  lifetimeValue: number;
  status: "active" | "inactive" | "blocked";
}

export interface DonorAnalytics {
  donorId: string;
  metrics: {
    totalDonated: number;
    donationFrequency: number;
    averageDonation: number;
    largestDonation: number;
    daysSinceFirstDonation: number;
    daysSinceLastDonation: number;
    engagementRate: number;
    responseRate: number;
    retentionScore: number;
  };
  predictions: {
    churnProbability: number;
    lifetimeValue: number;
    nextDonationAmount: number;
    optimalContactTiming: {
      dayOfWeek: number;
      hourOfDay: number;
    };
  };
  trends: {
    donationTrend: "increasing" | "decreasing" | "stable";
    engagementTrend: "improving" | "declining" | "stable";
  };
}

export interface DonorSegment {
  id: string;
  name: string;
  description: string;
  donorIds: string[];
  criteria: {
    totalDonated?: { min?: number; max?: number };
    donationCount?: { min?: number; max?: number };
    lastDonationDays?: { min?: number; max?: number };
    engagementScore?: { min?: number; max?: number };
    churnRisk?: ("low" | "medium" | "high")[];
    customFields?: Record<string, any>;
  };
  metadata: {
    size: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

export interface DonorInsight {
  donorId: string;
  type: "behavioral" | "preference" | "predictive" | "opportunity";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  actionable: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
}
