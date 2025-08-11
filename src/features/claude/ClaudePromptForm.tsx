// src/features/claude/ClaudePromptForm.tsx
import { useState } from "react";

type Props = {
  // Controlled props (optional)
  value?: string;
  onChange?: (value: string) => void;

  // Common props
  onSubmit?: (value: string) => void;
  defaultValue?: string; // used when uncontrolled
  disabled?: boolean;
  isLoading?: boolean; // alias for disabled
};

export default function ClaudePromptForm({
  value,
  onChange,
  onSubmit,
  defaultValue = "",
  disabled,
  isLoading,
}: Props) {
  // Uncontrolled internal state
  const [inner, setInner] = useState<string>(defaultValue ?? "");
  const current = value ?? inner ?? "";

  const handleChange = (v: string) => {
    if (onChange) onChange(v);
    else setInner(v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = (current ?? "").trim();
    if (!v) return;
    onSubmit?.(v);
    if (!onChange) setInner(""); // clear only in uncontrolled mode
  };

  const isDisabled = Boolean(disabled ?? isLoading) || !current.trim();

  return (
    <form onSubmit={handleSubmit} aria-label="Claude prompt form">
      <input
        aria-label="Prompt"
        value={current}
        onChange={(e) => handleChange(e.target.value)}
      />
      <button type="submit" disabled={isDisabled}>
        Send to Claude
      </button>
    </form>
  );
}
