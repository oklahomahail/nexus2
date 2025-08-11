import { CheckCircle, Copy, RotateCcw } from "lucide-react";

import IconButton from "@/components/IconButton";

export interface ClaudeResponseViewProps {
  response: string;
  copySuccess: boolean;
  onCopy: () => void;
  onNewRequest: () => void;
}

const ClaudeResponseView: React.FC<ClaudeResponseViewProps> = ({
  response,
  copySuccess,
  onCopy,
  onNewRequest,
}) => {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
          Claude's Response
        </h3>
        <div className="flex space-x-2">
          <IconButton
            onClick={onCopy}
            label={copySuccess ? "Copied!" : "Copy"}
            icon={Copy}
            variant={copySuccess ? "success" : "default"}
          />
          <IconButton
            onClick={onNewRequest}
            label="New Request"
            icon={RotateCcw}
          />
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
        <pre className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-mono">
          {response}
        </pre>
      </div>
    </div>
  );
};

export default ClaudeResponseView;
