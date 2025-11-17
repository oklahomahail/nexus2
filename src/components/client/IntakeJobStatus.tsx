// Intake Job Status Component
// Real-time status display during document processing

import type { ClientIntakeJob } from "@/types/clientIntake";

interface IntakeJobStatusProps {
  job: ClientIntakeJob | null;
  loading: boolean;
  isProcessing: boolean;
}

export function IntakeJobStatus({
  job,
  loading,
  isProcessing,
}: IntakeJobStatusProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-200 font-medium">Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No job information available</p>
      </div>
    );
  }

  // Processing stages with icons
  const stages = [
    {
      name: "Uploading document",
      complete: true,
      icon: "📤",
    },
    {
      name: "Extracting text",
      complete: job.status !== "pending",
      icon: "📄",
    },
    {
      name: "Analyzing with AI",
      complete: job.status === "completed" || job.status === "review_required",
      icon: "🤖",
    },
    {
      name: "Structuring data",
      complete: job.status === "completed" || job.status === "review_required",
      icon: "📊",
    },
  ];

  const currentStageIndex = stages.findIndex((s) => !s.complete);
  const activeStageIndex =
    currentStageIndex === -1 ? stages.length - 1 : currentStageIndex;

  return (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <div className="text-4xl mb-4">
          {isProcessing ? "⚙️" : job.status === "failed" ? "❌" : "✅"}
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          {isProcessing
            ? "Processing your document..."
            : job.status === "failed"
              ? "Processing failed"
              : "Processing complete!"}
        </h3>
        <p className="text-sm text-slate-400">{job.uploaded_file_name}</p>
      </div>

      {/* Progress stages */}
      <div className="space-y-3 max-w-md mx-auto">
        {stages.map((stage, index) => (
          <div
            key={stage.name}
            className={`
              flex items-center gap-3 p-3 rounded-lg transition-all
              ${
                index === activeStageIndex
                  ? "bg-blue-500/10 border border-blue-500/30"
                  : stage.complete
                    ? "bg-green-500/10 border border-transparent"
                    : "bg-slate-800/50 border border-transparent"
              }
            `}
          >
            {/* Icon */}
            <div
              className={`
                text-2xl
                ${index === activeStageIndex && !stage.complete ? "animate-bounce" : ""}
              `}
            >
              {stage.complete ? "✓" : stage.icon}
            </div>

            {/* Label */}
            <div className="flex-1">
              <p
                className={`
                  text-sm font-medium
                  ${
                    stage.complete
                      ? "text-green-400"
                      : index === activeStageIndex
                        ? "text-blue-400"
                        : "text-slate-400"
                  }
                `}
              >
                {stage.name}
              </p>
            </div>

            {/* Status indicator */}
            {index === activeStageIndex && !stage.complete && (
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error message */}
      {job.status === "failed" && job.error_message && (
        <div className="max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{job.error_message}</p>
        </div>
      )}

      {/* Time estimate */}
      {isProcessing && (
        <div className="text-center">
          <p className="text-xs text-slate-500">
            This usually takes 30-60 seconds
          </p>
        </div>
      )}

      {/* Confidence score (if complete) */}
      {job.extracted_data && (
        <div className="max-w-md mx-auto p-4 bg-slate-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Confidence Score</span>
            <span
              className={`
                text-lg font-semibold
                ${
                  job.extracted_data.confidence_score >= 80
                    ? "text-green-400"
                    : job.extracted_data.confidence_score >= 60
                      ? "text-yellow-400"
                      : "text-orange-400"
                }
              `}
            >
              {job.extracted_data.confidence_score}%
            </span>
          </div>
          {job.extracted_data.missing_sections &&
            job.extracted_data.missing_sections.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Missing sections:</p>
                <p className="text-xs text-slate-400">
                  {job.extracted_data.missing_sections.join(", ")}
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
