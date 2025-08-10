import { useMemo, useState } from "react";
import WritingEditor from "./WritingEditor";
import { ClaudeToolbar } from "@features/claude"; // via features barrel
import WritingToolbar from "@/components/composer/WritingToolbar";
import type { ExportFormat } from "@/types/writing";

export interface ComposerProps {
  initial?: string;
  initialTitle?: string;
  purpose?: "donor_email" | "campaign_update" | "note" | "custom";
  context?: Record<string, unknown>;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
}

export default function Composer({
  initial,
  initialTitle = "Untitled",
  purpose = "donor_email",
  context,
  onChange,
  onSubmit,
  className,
}: ComposerProps) {
  const [title, setTitle] = useState<string>(initialTitle);
  const [value, setValue] = useState<string>(initial ?? "");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("markdown");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const mergedContext = useMemo(
    () => ({ purpose, title, ...(context ?? {}) }),
    [purpose, title, context]
  );

  const handleInsert = (text: string) => {
    setValue((v) => {
      const next = v ? `${v}\n\n${text}` : text;
      onChange?.(next);
      return next;
    });
  };

  const handleChange = (next: string) => {
    setValue(next);
    onChange?.(next);
  };

  const handleManualSave = async () => {
    try {
      setIsSaving(true);
      onSubmit?.(value);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  const doDownload = (filename: string, content: BlobPart, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const safeTitle = title?.trim() ? title.trim() : "document";
      switch (exportFormat) {
        case "markdown":
          doDownload(`${safeTitle}.md`, value, "text/markdown;charset=utf-8");
          break;
        case "txt":
          doDownload(`${safeTitle}.txt`, value, "text/plain;charset=utf-8");
          break;
        case "docx":
          // Placeholder: swap for real DOCX generation if/when you add it
          doDownload(
            `${safeTitle}.docx`,
            value,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          );
          break;
        default:
          doDownload(`${safeTitle}.txt`, value, "text/plain;charset=utf-8");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleClaudeAssist = () => {
    handleInsert(
      "[[Prompt Claude: draft a donor email aligned to Track15 style]]"
    );
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        <WritingToolbar
          title={title}
          onTitleChange={setTitle}
          onManualSave={handleManualSave}
          onExport={handleExport}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          onClaudeAssist={handleClaudeAssist}
          isSaving={isSaving}
          isExporting={isExporting}
          lastSaved={lastSaved}
        />

        <ClaudeToolbar context={mergedContext} onInsert={handleInsert} />

        <WritingEditor value={value} onChange={handleChange} onTextSelect={function (): void {
          throw new Error("Function not implemented.");
        } } />
      </div>
    </div>
  );
}
