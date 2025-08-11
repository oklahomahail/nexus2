import { MessageSquare, Send } from "lucide-react";
import { ChangeEvent } from "react";

export interface ClaudePromptFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ClaudePromptForm: React.FC<ClaudePromptFormProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
        Custom Request
      </h3>
      <div className="space-y-3">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="Ask Claude anything about your campaign, request content creation, or get strategic advice..."
          className="w-full h-24 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none transition-all"
        />
        <button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? "Generating..." : "Send to Claude"}</span>
        </button>
      </div>
    </div>
  );
};

export default ClaudePromptForm;
