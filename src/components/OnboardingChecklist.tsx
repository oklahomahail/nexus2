import { CheckCircle, Circle, Target, Users, BarChart3, FileDown, User } from "lucide-react";
import React from "react";

import { 
  getOnboardingChecklist, 
  getOnboardingProgress, 
  OnboardingStep,
  markOnboardingStepCompleted 
} from "@/utils/onboarding";

const stepConfig: Record<OnboardingStep, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  color: string;
}> = {
  add_client: {
    icon: Users,
    label: "Add a Client",
    description: "Create your first client profile",
    color: "text-blue-400",
  },
  create_campaign: {
    icon: Target,
    label: "Create Campaign",
    description: "Launch your first fundraising campaign",
    color: "text-green-400",
  },
  view_analytics: {
    icon: BarChart3,
    label: "View Analytics",
    description: "Explore performance insights",
    color: "text-purple-400",
  },
  export_report: {
    icon: FileDown,
    label: "Export Report",
    description: "Generate your first data report",
    color: "text-orange-400",
  },
  complete_profile: {
    icon: User,
    label: "Complete Profile",
    description: "Finish setting up your account",
    color: "text-pink-400",
  },
};

interface OnboardingChecklistProps {
  className?: string;
  onStepClick?: (step: OnboardingStep) => void;
  compact?: boolean;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  className = "",
  onStepClick,
  compact = false,
}) => {
  const checklist = getOnboardingChecklist();
  const progress = getOnboardingProgress();

  // Test function to mark steps as complete (remove in production)
  const handleStepToggle = (step: OnboardingStep, completed: boolean) => {
    if (!completed && process.env.NODE_ENV === "development") {
      markOnboardingStepCompleted(step);
      // Force re-render by calling parent if needed
      window.location.reload();
    }
    onStepClick?.(step);
  };

  if (compact) {
    return (
      <div className={`bg-slate-800/30 border border-slate-700 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium text-sm">Quick Start</h3>
          <span className="text-slate-400 text-xs">
            {progress.completed}/{progress.total}
          </span>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        {progress.percentage === 100 ? (
          <div className="text-center text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 mx-auto mb-1" />
            All set! You're ready to go.
          </div>
        ) : (
          <div className="text-slate-400 text-xs text-center">
            {progress.completed > 0 
              ? `Great progress! ${5 - progress.completed} steps remaining.`
              : "Complete these tasks to get the most out of Nexus."
            }
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/30 border border-slate-700 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Getting Started</h3>
        <div className="text-right">
          <div className="text-white font-medium text-sm">
            {progress.completed} / {progress.total}
          </div>
          <div className="text-slate-400 text-xs">
            {progress.percentage}% complete
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {Object.entries(stepConfig).map(([step, config]) => {
          const isCompleted = checklist[step]?.completed ?? false;
          const Icon = config.icon;
          const CheckIcon = isCompleted ? CheckCircle : Circle;

          return (
            <button
              key={step}
              onClick={() => handleStepToggle(step as OnboardingStep, isCompleted)}
              className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors text-left group"
              disabled={isCompleted && !onStepClick}
            >
              <div className="flex-shrink-0 mt-0.5">
                <CheckIcon 
                  className={`w-5 h-5 transition-colors ${
                    isCompleted 
                      ? "text-green-500" 
                      : "text-slate-500 group-hover:text-slate-400"
                  }`} 
                />
              </div>

              <div className="flex-shrink-0 mt-0.5">
                <Icon 
                  className={`w-4 h-4 ${
                    isCompleted ? config.color : "text-slate-500"
                  }`} 
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className={`font-medium text-sm transition-colors ${
                  isCompleted 
                    ? "text-white" 
                    : "text-slate-300 group-hover:text-white"
                }`}>
                  {config.label}
                </div>
                <div className="text-slate-400 text-xs mt-0.5">
                  {config.description}
                </div>
                {isCompleted && checklist[step]?.completedAt && (
                  <div className="text-green-400 text-xs mt-1">
                    ✓ Completed {checklist[step].completedAt?.toLocaleDateString()}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {progress.percentage === 100 && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Onboarding Complete!</span>
          </div>
          <div className="text-green-300 text-xs mt-1">
            You've successfully set up your Nexus account and are ready to manage your nonprofit effectively.
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklist;