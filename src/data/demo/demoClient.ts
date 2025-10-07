import type { Client } from "@/types/client";

export const demoClient: Client = {
  id: "client_regional_food_bank",
  name: "Regional Food Bank",
  shortName: "RFB",
  primaryContactName: "Jane Doe",
  primaryContactEmail: "jane.doe@regionalfoodbank.org",
  notes: "Community nonprofit providing meals to families facing food insecurity. Established 1985, serves 15,000+ families annually across 3 counties.",
  createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
  updatedAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
};

export const demoClientMetadata = {
  slug: "regional-food-bank",
  sector: "Food Security",
  website: "https://regionalfoodbank.org",
  logo: "/assets/demo/regional-food-bank-logo.svg", // Placeholder path
  branding: {
    primaryColor: "#2E8B57", // Sea Green - appropriate for food/sustainability
    secondaryColor: "#F4A460", // Sandy Brown - warm, inviting
    logoUrl: "/assets/demo/regional-food-bank-logo.svg"
  },
  socialMedia: {
    facebook: "@RegionalFoodBank",
    twitter: "@RegionalFB",
    instagram: "@regionalfoodbank"
  },
  stats: {
    yearlyBudget: 850000,
    volunteersActive: 450,
    familiesServed: 15000,
    mealsProvided: 2400000
  }
};