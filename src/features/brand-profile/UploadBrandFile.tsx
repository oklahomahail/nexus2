/**
 * Upload Brand File Component
 * Allows users to upload brand guideline documents (TXT, MD)
 * and automatically extract brand profile information using Claude
 */

import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useRef, useState } from "react";

import {
  processBrandFile,
  validateFileSize,
  getSupportedExtensions,
} from "./brandFileProcessor";
import { BrandProfile } from "./brandProfile.types";
import { extractBrandProfileFromText } from "./extractBrandProfileFromText";

interface UploadBrandFileProps {
  onAutoFill: (data: Partial<BrandProfile>) => void;
}

type UploadStatus = "idle" | "uploading" | "extracting" | "success" | "error";

export const UploadBrandFile = ({ onAutoFill }: UploadBrandFileProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setStatus("uploading");
    setMessage("Reading file...");

    try {
      // Validate file size
      if (!validateFileSize(file)) {
        throw new Error("File is too large. Maximum size is 5MB.");
      }

      // Extract text from file
      const text = await processBrandFile(file);

      if (!text.trim()) {
        throw new Error("File appears to be empty.");
      }

      setStatus("extracting");
      setMessage("Analyzing brand guidelines with AI...");

      // Use Claude to extract structured data
      const extracted = await extractBrandProfileFromText(text);

      // Auto-fill the form
      onAutoFill(extracted);

      setStatus("success");
      setMessage("Brand profile extracted successfully!");

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
        setFileName("");
      }, 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to process file");

      // Reset to idle after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
        setFileName("");
      }, 5000);
    }
  };

  const handleClick = () => {
    if (status === "uploading" || status === "extracting") {
      return; // Prevent clicking while processing
    }
    inputRef.current?.click();
  };

  const isProcessing = status === "uploading" || status === "extracting";
  const supportedExtensions = getSupportedExtensions();

  return (
    <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-sm font-medium text-gray-800 mb-1">
            Upload Brand Guidelines
          </h3>
          <p className="text-xs text-gray-600">
            Upload a text file containing your brand guidelines. We'll
            automatically extract your mission, tone, and messaging pillars.
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleClick}
          disabled={isProcessing}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-3 rounded-sm text-sm font-medium
            transition-colors border-2 border-dashed
            ${
              isProcessing
                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                : "bg-white text-[#1C1E26] border-gray-300 hover:border-[#D4AF37] hover:bg-gray-50"
            }
          `}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Upload size={16} />
              <span>Choose File</span>
            </>
          )}
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={supportedExtensions.map((ext) => `.${ext}`).join(",")}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              void handleFile(e.target.files[0]);
            }
          }}
        />

        {/* Status Messages */}
        {status !== "idle" && (
          <div
            className={`
            flex items-start gap-2 p-3 rounded-md text-sm
            ${status === "success" ? "bg-green-50 text-green-800" : ""}
            ${status === "error" ? "bg-red-50 text-red-800" : ""}
            ${isProcessing ? "bg-blue-50 text-blue-800" : ""}
          `}
          >
            {status === "success" && (
              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
            )}
            {status === "error" && (
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            )}
            {isProcessing && (
              <FileText size={16} className="mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              {fileName && <div className="font-medium mb-1">{fileName}</div>}
              <div className="text-xs">{message}</div>
            </div>
          </div>
        )}

        {/* Supported Formats */}
        <div className="text-xs text-gray-500">
          Supported formats: {supportedExtensions.join(", ").toUpperCase()}
        </div>
      </div>
    </div>
  );
};
