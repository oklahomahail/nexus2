import { createTourWithValidation, TourStep } from "./driverService";
import { markCampaignsTourCompleted } from "@/utils/onboarding";

const steps: TourStep[] = [
  {
    popover: {
      title: "Campaign Management",
      description: "Let's explore the campaigns section in detail. Here you'll manage all your fundraising efforts from start to finish.",
      position: "center",
    },
  },
  {
    element: '[data-tour="campaigns-title"]',
    popover: {
      title: "Campaign Overview",
      description: "This is your campaign dashboard showing all active and past campaigns at a glance.",
      position: "bottom",
    },
  },
  {
    element: '[data-tour="campaigns-new"]',
    popover: {
      title: "Create New Campaign",
      description: "Click here to start the campaign creation wizard. You'll set goals, target audiences, and timeline.",
      position: "bottom",
    },
  },
  {
    element: '[data-tour="campaigns-stats"]',
    popover: {
      title: "Key Performance Metrics",
      description: "Monitor your campaign performance with these key metrics: total raised, active campaigns, and success rates.",
      position: "top",
    },
  },
  {
    element: '[data-tour="campaigns-list"]',
    popover: {
      title: "Campaign List",
      description: "View all your campaigns here. You can switch between grid and table views, filter by status, and drill down into individual campaigns.",
      position: "top",
    },
  },
  {
    popover: {
      title: "Campaign Tour Complete!",
      description: "You now know the basics of managing campaigns in Nexus. Create your first campaign to get started!",
      position: "center",
    },
  },
];

export const startCampaignsTour = async () => {
  try {
    const tour = await createTourWithValidation(steps, {
      onDestroyed: () => {
        markCampaignsTourCompleted();
      },
    });
    
    tour.drive();
  } catch (error) {
    console.error("Failed to start campaigns tour:", error);
  }
};

export { steps as campaignsTourSteps };