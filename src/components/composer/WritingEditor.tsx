// src/components/Writing/WritingEditor.tsx
import React, { forwardRef } from "react";

export interface WritingEditorProps {
  value: string;
  onChange: (val: string) => void;
  onTextSelect: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const WritingEditor = forwardRef<HTMLTextAreaElement, WritingEditorProps>(
  (
    {
      value,
      onChange,
      onTextSelect,
      placeholder = "Start writing...",
      disabled = false,
      className,
    },
    ref,
  ) => {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={onTextSelect}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 ${className || ""}`}
        style={{ minHeight: "400px" }}
      />
    );
  },
);

WritingEditor.displayName = "WritingEditor";
export default WritingEditor;
