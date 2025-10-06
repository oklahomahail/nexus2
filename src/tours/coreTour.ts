import { createTourWithValidation, TourStep } from "./driverService";
import { markCoreTourCompleted } from "@/utils/onboarding";

const steps: TourStep[] = [
  {
    popover: {
      title: "Welcome to Nexus!",
      description: "Let's take a quick tour of your nonprofit management platform. This will help you get started with managing campaigns, donors, and analytics.",
      position: "bottom",
    },
  },
  {
    element: '[data-tour="nav-dashboard"]',
    popover: {
      title: "Dashboard",
      description: "Your home base for monitoring key metrics, recent activity, and getting an overview of your nonprofit's performance.",
      position: "right",
    },
  },
  {
    element: '[data-tour="nav-campaigns"]',
    popover: {
      title: "Campaigns",
      description: "Plan, launch, and track your fundraising campaigns. This is where you'll create new campaigns and monitor their progress.",
      position: "right",
    },
  },
  {
    element: '[data-tour="new-campaign-button"]',
    popover: {
      title: "Create Campaigns",
      description: "Start new fundraising campaigns with our guided wizard. Set goals, target audiences, and track progress.",
      position: "bottom",
    },
  },
  {
    element: '[data-tour="nav-analytics"]',
    popover: {
      title: "Analytics",
      description: "Deep dive into your organization's performance with detailed reports, charts, and insights to help you make data-driven decisions.",
      position: "right",
    },
  },
  {
    element: '[data-tour="nav-donors"]',
    popover: {
      title: "Donors",
      description: "Manage your donor relationships, view giving history, and segment your supporter base for targeted outreach.",
      position: "right",
    },
  },
  {
    element: '[data-tour="user-menu"]',
    popover: {
      title: "User Settings",
      description: "Access your profile settings, organization preferences, and account management options here.",
      position: "left",
    },
  },
  {
    popover: {
      title: "You're All Set!",
      description: "That's the basics of Nexus! You can always replay this tour from the Help menu. Ready to start building your first campaign?",
      position: "center",
    },
  },
];

export const startCoreTour = async () => {
  try {
    const tour = await createTourWithValidation(steps, {
      onDestroyed: () => {
        // Mark tour as completed when user finishes or closes it
        markCoreTourCompleted();
      },
    });
    
    tour.drive();
  } catch (error) {
    console.error("Failed to start core tour:", error);
  }
};

export { steps as coreTourSteps };