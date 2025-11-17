// Client Intake Wizard
// Multi-step wizard for uploading and processing client brand briefs

import React, { useState } from "react";

import { Modal, Button, FileUpload } from "@/components/ui-kit";
import { useIntakeJob } from "@/hooks/useIntakeJob";
import { clientIntakeService } from "@/services/clientIntakeService";
import type { ExtractedBrandData } from "@/types/clientIntake";

import { BrandProfileReview } from "./BrandProfileReview";
import { IntakeJobStatus } from "./IntakeJobStatus";

interface ClientIntakeWizardProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSuccess: (brandProfileId: string) => void;
}

type WizardStep = "upload" | "processing" | "review" | "saving";

export function ClientIntakeWizard({
  isOpen,
  onClose,
  clientId,
  onSuccess,
}: ClientIntakeWizardProps) {
  const [step, setStep] = useState<WizardStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<ExtractedBrandData | null>(null);

  const {
    job,
    loading: jobLoading,
    isProcessing,
    isComplete,
    isFailed,
    extractedData,
  } = useIntakeJob(currentJobId);

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file");
      return;
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(pdf|txt|md|docx)$/i)
    ) {
      setUploadError("Please upload a PDF, TXT, MD, or DOCX file");
      return;
    }

    setUploadError(null);
    setStep("processing");

    try {
      const job = await clientIntakeService.uploadClientBrief(clientId, file);
      setCurrentJobId(job.id);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
      setStep("upload");
    }
  };

  // Handle job completion
  React.useEffect(() => {
    if (isComplete && extractedData && step === "processing") {
      setEditedData(extractedData);
      setStep("review");
    } else if (isFailed && step === "processing") {
      setUploadError(job?.error_message || "Processing failed");
      setStep("upload");
    }
  }, [isComplete, isFailed, extractedData, job, step]);

  // Handle data commit
  const handleCommit = async () => {
    if (!currentJobId || !editedData) return;

    setStep("saving");

    try {
      const brandProfileId = await clientIntakeService.commitIntakeData(
        currentJobId,
        editedData,
      );
      onSuccess(brandProfileId);
      handleClose();
    } catch (error) {
      console.error("Commit error:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to save");
      setStep("review");
    }
  };

  // Handle close
  const handleClose = () => {
    setStep("upload");
    setFile(null);
    setUploadError(null);
    setCurrentJobId(null);
    setEditedData(null);
    onClose();
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case "upload":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">
                Upload Client Brief
              </h3>
              <p className="text-sm text-slate-400">
                Upload a brand brief, client intake document, or marketing
                strategy document. Our AI will extract and structure the key
                information.
              </p>
            </div>

            <FileUpload
              value={file ? [file] : []}
              onChange={(files) => setFile(files[0] || null)}
              accept=".pdf,.txt,.md,.docx,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple={false}
              maxFiles={1}
              maxFileSize={10 * 1024 * 1024} // 10MB
              label="Client Document"
              description="Supported formats: PDF, DOCX, TXT, MD (max 10MB)"
              placeholder="Click to upload or drag and drop"
              error={uploadError || undefined}
              onError={setUploadError}
              showPreview={true}
            />

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                The document will be processed with AI to extract brand voice,
                messaging, and other key information.
              </span>
            </div>
          </div>
        );

      case "processing":
        return (
          <IntakeJobStatus
            job={job}
            loading={jobLoading}
            isProcessing={isProcessing}
          />
        );

      case "review":
        return editedData ? (
          <BrandProfileReview
            extractedData={editedData}
            onEdit={setEditedData}
          />
        ) : (
          <div className="text-center py-8 text-slate-400">
            No data to review
          </div>
        );

      case "saving":
        return (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-200 font-medium">
              Saving brand profile...
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Creating brand profile and storing extracted data
            </p>
          </div>
        );
    }
  };

  // Render footer buttons
  const renderFooter = () => {
    switch (step) {
      case "upload":
        return (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file}>
              Process Document
            </Button>
          </>
        );

      case "processing":
        return (
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        );

      case "review":
        return (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setStep("upload");
                setCurrentJobId(null);
                setEditedData(null);
              }}
            >
              Start Over
            </Button>
            <Button onClick={handleCommit}>Create Brand Profile</Button>
          </>
        );

      case "saving":
        return null;
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={
        step === "processing" || step === "saving" ? () => {} : handleClose
      }
      title="Client Onboarding"
      size="xl"
      closeOnOverlayClick={step !== "processing" && step !== "saving"}
      closeOnEscape={step !== "processing" && step !== "saving"}
      showCloseButton={step !== "processing" && step !== "saving"}
    >
      <div className="space-y-6">
        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-2 pb-4 border-b border-slate-700">
          <StepIndicator
            number={1}
            label="Upload"
            active={step === "upload"}
            completed={step !== "upload"}
          />
          <div className="w-12 h-0.5 bg-slate-700" />
          <StepIndicator
            number={2}
            label="Process"
            active={step === "processing"}
            completed={step === "review" || step === "saving"}
          />
          <div className="w-12 h-0.5 bg-slate-700" />
          <StepIndicator
            number={3}
            label="Review"
            active={step === "review"}
            completed={step === "saving"}
          />
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">{renderStepContent()}</div>

        {/* Footer */}
        {renderFooter() && (
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            {renderFooter()}
          </div>
        )}
      </div>
    </Modal>
  );
}

// Step indicator component
function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
          transition-colors
          ${
            completed
              ? "bg-green-500 text-white"
              : active
                ? "bg-blue-500 text-white"
                : "bg-slate-700 text-slate-400"
          }
        `}
      >
        {completed ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          number
        )}
      </div>
      <span
        className={`
          text-sm font-medium
          ${active ? "text-slate-200" : completed ? "text-green-400" : "text-slate-500"}
        `}
      >
        {label}
      </span>
    </div>
  );
}
