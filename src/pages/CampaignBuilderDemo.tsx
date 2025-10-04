import React, { useState } from "react";

import CampaignBuilderWizard, {
  CampaignBuilderData,
} from "../components/campaign/CampaignBuilderWizard";
import { Button } from "../components/ui-kit";

import type {
  CampaignPhase,
  CampaignGoal,
} from "../components/campaign/CampaignOverviewBuilder";

const CampaignBuilderDemo: React.FC = () => {
  const [showWizard, setShowWizard] = useState(true);
  const [completedCampaign, setCompletedCampaign] =
    useState<CampaignBuilderData | null>(null);

  const handleComplete = async (data: CampaignBuilderData) => {
    console.log("Campaign Builder completed with data:", data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setCompletedCampaign(data);
    setShowWizard(false);

    alert(
      "Campaign created successfully! Check console for complete data structure.",
    );
  };

  const handleCancel = () => {
    setShowWizard(false);
    setCompletedCampaign(null);
  };

  const resetDemo = () => {
    setShowWizard(true);
    setCompletedCampaign(null);
  };

  if (!showWizard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-white">
              🎉 Campaign Builder Complete!
            </h1>
            <p className="text-slate-400">
              Your campaign has been successfully created and is ready for
              launch.
            </p>
          </div>

          {completedCampaign?.overview && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                📋 Campaign Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 text-sm">
                      Campaign Name:
                    </span>
                    <p className="text-white font-medium">
                      {completedCampaign.overview.name}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-sm">Type:</span>
                    <p className="text-white capitalize">
                      {completedCampaign.overview.type}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-sm">Season:</span>
                    <p className="text-white capitalize">
                      {completedCampaign.overview.season}
                    </p>
                  </div>

                  {completedCampaign.overview.theme && (
                    <div>
                      <span className="text-slate-400 text-sm">Theme:</span>
                      <p className="text-white">
                        {completedCampaign.overview.theme}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {completedCampaign.overview.startDate &&
                    completedCampaign.overview.endDate && (
                      <div>
                        <span className="text-slate-400 text-sm">
                          Duration:
                        </span>
                        <p className="text-white">
                          {completedCampaign.overview.startDate.toLocaleDateString()}{" "}
                          -{" "}
                          {completedCampaign.overview.endDate.toLocaleDateString()}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {Math.ceil(
                            (completedCampaign.overview.endDate.getTime() -
                              completedCampaign.overview.startDate.getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          days
                        </p>
                      </div>
                    )}

                  <div>
                    <span className="text-slate-400 text-sm">
                      Campaign Phases:
                    </span>
                    <div className="space-y-1">
                      {completedCampaign.overview.phases.map(
                        (phase: CampaignPhase) => (
                          <div
                            key={phase.id}
                            className="text-white text-sm flex items-center gap-2"
                          >
                            <span
                              className={`
                            px-2 py-1 rounded text-xs font-medium
                            ${
                              phase.type === "cultivation"
                                ? "bg-blue-600"
                                : phase.type === "solicitation"
                                  ? "bg-orange-600"
                                  : "bg-green-600"
                            }
                          `}
                            >
                              {phase.type}
                            </span>
                            {phase.name}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-sm">Goals:</span>
                    <div className="space-y-1">
                      {completedCampaign.overview.goals.map(
                        (goal: CampaignGoal) => (
                          <div key={goal.id} className="text-white text-sm">
                            • {goal.target.toLocaleString()}
                            {goal.unit === "dollars"
                              ? " USD"
                              : goal.unit === "percentage"
                                ? "%"
                                : ""}
                            <span className="text-slate-400 ml-1">
                              ({goal.type}, {goal.priority})
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {completedCampaign.overview.description && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <span className="text-slate-400 text-sm">Description:</span>
                  <p className="text-white text-sm mt-1">
                    {completedCampaign.overview.description}
                  </p>
                </div>
              )}

              {completedCampaign.overview.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <span className="text-slate-400 text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {completedCampaign.overview.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Next Steps
            </h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>✅ Campaign overview configured</p>
              <p className="text-slate-500">
                ⏳ Audience segmentation (coming in Phase 2)
              </p>
              <p className="text-slate-500">
                ⏳ Messaging framework (coming in Phase 2)
              </p>
              <p className="text-slate-500">
                ⏳ Channel planning (coming in Phase 3)
              </p>
              <p className="text-slate-500">
                ⏳ Timeline integration (coming in Phase 4)
              </p>
              <p className="text-slate-500">
                ⏳ Match & challenge setup (coming in Phase 5)
              </p>
              <p className="text-slate-500">
                ⏳ Reporting dashboard (coming in Phase 6)
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-slate-400">
              Campaign ready for launch! You can now begin executing your
              fundraising strategy.
            </p>
            <Button onClick={resetDemo} variant="primary">
              Create Another Campaign
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CampaignBuilderWizard
      onComplete={handleComplete}
      onCancel={handleCancel}
      initialStep="overview"
    />
  );
};

export default CampaignBuilderDemo;
