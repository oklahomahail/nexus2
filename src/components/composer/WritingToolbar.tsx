import { Save, Sparkles, FileText, FileDown, File } from "lucide-react";

import type { ExportFormat } from "@/types/writing";

export interface WritingToolbarProps {
  title: string;
  onTitleChange: (value: string) => void;
  onManualSave: () => void;
  onExport: () => void;
  exportFormat: ExportFormat;
  setExportFormat: (format: ExportFormat) => void;
  onClaudeAssist: () => void;
  isSaving?: boolean;
  isExporting?: boolean;
  lastSaved?: Date | null;
}

export default function WritingToolbar({
  title,
  onTitleChange,
  onManualSave,
  onExport,
  exportFormat,
  setExportFormat,
  onClaudeAssist,
  isSaving = false,
  isExporting = false,
  lastSaved,
}: WritingToolbarProps) {
  const getExportIcon = () => {
    switch (exportFormat) {
      case "markdown":
        return <FileText className="w-4 h-4" />;
      case "docx":
        return <FileDown className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Title + Primary Actions */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Document title..."
          className="flex-1 px-3 py-2 rounded-lg text-sm
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors"
        />

        <button
          onClick={onManualSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white
            hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={onClaudeAssist}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Claude Assist
        </button>
      </div>

      {/* Export + Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            className="px-3 py-2 rounded-lg text-sm
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors"
          >
            <option value="markdown">Markdown (.md)</option>
            <option value="txt">Plain Text (.txt)</option>
            <option value="docx">Word Document (.docx)</option>
          </select>

          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {getExportIcon()}
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>

        {lastSaved && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
