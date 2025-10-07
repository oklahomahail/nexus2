// Export all demo data for easy importing
export { demoClient, demoClientMetadata } from "./demoClient";
export { 
  demoCampaignData, 
  demoCampaign, 
  demoCampaignMilestones,
  demoCampaignSegments 
} from "./demoCampaign";
export { demoAnalytics, demoReportData } from "./demoAnalytics";

// Convenience function to get all demo data
export const getDemoData = () => ({
  client: demoClient,
  clientMetadata: demoClientMetadata,
  campaignData: demoCampaignData,
  campaign: demoCampaign,
  campaignMilestones: demoCampaignMilestones,
  campaignSegments: demoCampaignSegments,
  analytics: demoAnalytics,
  reportData: demoReportData,
});

// Function to seed demo data (for development/tutorial)
export const seedDemoData = () => {
  const demoData = getDemoData();
  
  // Store in sessionStorage for tutorial (not localStorage to avoid persistence)
  sessionStorage.setItem('nexus.tutorial.demoData', JSON.stringify(demoData));
  
  return demoData;
};