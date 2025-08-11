import { Copy, RotateCcw } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

export type WritingEditorProps = {
  value?: string;
  onChange?: (next: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  showPreview?: boolean;
  /** Optional: invoked when user selects text (no args expected by current callers) */
  onTextSelect?: () => void;
};

const WritingEditor: React.FC<WritingEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing…",
  className = "",
  minRows = 10,
  showPreview = true,
  onTextSelect,
}) => {
  const isControlled = typeof value === "string";
  const [internal, setInternal] = useState<string>(value ?? "");

  useEffect(() => {
    if (isControlled) setInternal(value as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    if (!isControlled) setInternal(e.target.value);
    onChange?.(e.target.value);
  };

  const text = isControlled ? (value as string) : internal;
  const words = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/).length : 0),
    [text],
  );
  const chars = text.length;

  const wrapClass = ["space-y-4", className].filter(Boolean).join(" ");
  const toolbarBtn =
    "px-3 py-2 text-sm rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-colors flex items-center gap-2";
  const statBadge =
    "text-xs px-2 py-0.5 rounded bg-slate-800/50 text-slate-300 border border-slate-700/50";

  return (
    <div className={wrapClass}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={statBadge}>Words: {words}</span>
          <span className={statBadge}>Chars: {chars}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
              } catch {
                /* noop */
              }
            }}
            className={toolbarBtn}
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isControlled) setInternal("");
              onChange?.("");
            }}
            className={toolbarBtn}
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        rows={minRows}
        value={text}
        onChange={handleChange}
        onSelect={onTextSelect}
        placeholder={placeholder}
        className={[
          "input-base",
          "w-full",
          "font-sans",
          "text-slate-200",
          "placeholder-slate-400",
          "resize-none",
          "min-h-48",
        ].join(" ")}
      />

      {/* Preview */}
      {showPreview && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs mb-2">Preview</div>
          <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
            {text || "Nothing to preview yet."}
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingEditor;
