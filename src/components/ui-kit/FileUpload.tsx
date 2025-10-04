import clsx from "clsx";
import React, { useState, useRef, useCallback } from "react";

export interface FileUploadProps {
  value?: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
  showPreview?: boolean;
  onError?: (error: string) => void;
}

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  showRemove?: boolean;
}

// File Preview Component
const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  showRemove = true,
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }

    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [file, preview]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎥";
    if (type.startsWith("audio/")) return "🎵";
    if (type === "application/pdf") return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    if (type.includes("presentation") || type.includes("powerpoint"))
      return "📽️";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    return "📎";
  };

  return (
    <div className="relative group bg-slate-800/50 border border-slate-700 rounded-lg p-3 hover:bg-slate-800/70 transition-colors">
      <div className="flex items-center gap-3">
        {/* File Preview/Icon */}
        <div className="flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt={file.name}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded">
              <span className="text-xl">{getFileIcon(file.type)}</span>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {file.name}
          </p>
          <p className="text-xs text-slate-400">
            {formatFileSize(file.size)} • {file.type || "Unknown type"}
          </p>
        </div>

        {/* Remove Button */}
        {showRemove && (
          <button
            onClick={onRemove}
            className="flex-shrink-0 p-1 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Main File Upload Component
export const FileUpload: React.FC<FileUploadProps> = ({
  value = [],
  onChange,
  accept,
  multiple = false,
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  label,
  description,
  placeholder = "Click to upload or drag and drop",
  disabled = false,
  error,
  required = false,
  className,
  showPreview = true,
  onError,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, _setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (files: File[]) => {
      if (disabled) return;

      const validateFiles = (
        files: File[],
      ): { valid: File[]; invalid: string[] } => {
        const valid: File[] = [];
        const invalid: string[] = [];

        files.forEach((file) => {
          // Check file size
          if (file.size > maxFileSize) {
            invalid.push(
              `${file.name}: File size too large (max ${(maxFileSize / 1024 / 1024).toFixed(1)}MB)`,
            );
            return;
          }

          // Check file count
          if (valid.length + value.length >= maxFiles) {
            invalid.push(`Maximum ${maxFiles} files allowed`);
            return;
          }

          // Check if file already exists
          if (
            value.some(
              (existingFile) =>
                existingFile.name === file.name &&
                existingFile.size === file.size,
            )
          ) {
            invalid.push(`${file.name}: File already selected`);
            return;
          }

          valid.push(file);
        });

        return { valid, invalid };
      };

      const { valid, invalid } = validateFiles(files);

      if (invalid.length > 0 && onError) {
        onError(invalid.join(", "));
      }

      if (valid.length > 0) {
        const newFiles = multiple ? [...value, ...valid] : valid.slice(0, 1);
        onChange(newFiles);
      }
    },
    [value, onChange, multiple, disabled, maxFiles, maxFileSize, onError],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFileSelect(files);

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      const files = Array.from(event.dataTransfer.files);
      handleFileSelect(files);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemoveFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={clsx("space-y-4", className)}>
      {/* Label */}
      {label && (
        <div>
          <label className="block text-sm font-medium text-slate-200">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {description && (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          "relative border-2 border-dashed rounded-lg transition-colors cursor-pointer",
          {
            "border-blue-500 bg-blue-500/10": isDragOver,
            "border-slate-600 hover:border-slate-500 bg-slate-800/30":
              !isDragOver && !error && !disabled,
            "border-red-500 bg-red-500/10": error,
            "border-slate-700 bg-slate-800/50 cursor-not-allowed opacity-50":
              disabled,
          },
        )}
      >
        <div className="p-6 text-center">
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-slate-400">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📁</div>
              <div>
                <p className="text-sm text-slate-200">{placeholder}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {accept &&
                    `Supported formats: ${accept.replace(/\./g, "").toUpperCase()}`}
                  {maxFileSize &&
                    ` • Max size: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`}
                  {multiple && ` • Max files: ${maxFiles}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
        />
      </div>

      {/* File Previews */}
      {showPreview && value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-200">
            Selected Files ({value.length})
          </h4>
          <div className="space-y-2">
            {value.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => handleRemoveFile(index)}
                showRemove={!disabled}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload Summary for Multiple Files */}
      {!showPreview && value.length > 0 && (
        <div className="text-sm text-slate-400">
          {value.length} file{value.length !== 1 ? "s" : ""} selected
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default FileUpload;
