import React, { useState } from "react";

import CampaignOverviewBuilder, {
  CampaignOverview,
} from "../components/campaign/CampaignOverviewBuilder";

const CampaignOverviewDemo: React.FC = () => {
  const [campaignData, setCampaignData] = useState<CampaignOverview | null>(
    null,
  );
  const [showBuilder, setShowBuilder] = useState(true);

  // Sample initial data for testing
  const sampleData: Partial<CampaignOverview> = {
    name: "2024 Spring Appeal",
    type: "annual",
    season: "spring",
    theme: "Growing Together",
    description:
      "Our annual spring fundraising campaign focused on community growth and education initiatives.",
    tags: ["community", "online"],
  };

  const handleSave = (data: CampaignOverview) => {
    setCampaignData(data);
    console.log("Campaign saved:", data);
    alert("Campaign saved successfully! Check console for details.");
  };

  const handleNext = (data: CampaignOverview) => {
    setCampaignData(data);
    console.log("Moving to next step with data:", data);
    setShowBuilder(false);
    alert("Campaign saved! Moving to Audience Segmentation step.");
  };

  const handleCancel = () => {
    setShowBuilder(false);
    alert("Campaign creation cancelled.");
  };

  const resetDemo = () => {
    setCampaignData(null);
    setShowBuilder(true);
  };

  if (!showBuilder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold text-white">
            Campaign Overview Complete!
          </h1>

          {campaignData && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 text-left">
              <h2 className="text-xl font-semibold text-white mb-4">
                Campaign Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-400">Name:</span>
                  <span className="text-white ml-2 font-medium">
                    {campaignData.name}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white ml-2">{campaignData.type}</span>
                </div>

                <div>
                  <span className="text-slate-400">Season:</span>
                  <span className="text-white ml-2">{campaignData.season}</span>
                </div>

                {campaignData.theme && (
                  <div>
                    <span className="text-slate-400">Theme:</span>
                    <span className="text-white ml-2">
                      {campaignData.theme}
                    </span>
                  </div>
                )}

                {campaignData.startDate && campaignData.endDate && (
                  <div>
                    <span className="text-slate-400">Duration:</span>
                    <span className="text-white ml-2">
                      {campaignData.startDate.toLocaleDateString()} -{" "}
                      {campaignData.endDate.toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-slate-400">Phases:</span>
                  <div className="ml-2 space-y-1">
                    {campaignData.phases.map((phase) => (
                      <div key={phase.id} className="text-white text-xs">
                        • {phase.name} ({phase.type})
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Goals:</span>
                  <div className="ml-2 space-y-1">
                    {campaignData.goals.map((goal) => (
                      <div key={goal.id} className="text-white text-xs">
                        • {goal.target.toLocaleString()}
                        {goal.unit === "dollars"
                          ? " USD"
                          : goal.unit === "percentage"
                            ? "%"
                            : ""}
                        ({goal.type}, {goal.priority})
                      </div>
                    ))}
                  </div>
                </div>

                {campaignData.tags.length > 0 && (
                  <div>
                    <span className="text-slate-400">Tags:</span>
                    <span className="text-white ml-2">
                      {campaignData.tags.join(", ")}
                    </span>
                  </div>
                )}

                {campaignData.description && (
                  <div>
                    <span className="text-slate-400">Description:</span>
                    <p className="text-white ml-2 text-sm mt-1">
                      {campaignData.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-slate-400">
              Next step would be the Audience Segmentation Tool
            </p>

            <button
              onClick={resetDemo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">
          Campaign Overview Builder Demo
        </h1>
        <p className="text-slate-400">
          Test the Campaign Overview Builder component with form validation and
          UI components
        </p>
      </div>

      <CampaignOverviewBuilder
        initialData={sampleData}
        onSave={handleSave}
        onNext={handleNext}
        onCancel={handleCancel}
        isLoading={false}
      />
    </div>
  );
};

export default CampaignOverviewDemo;
