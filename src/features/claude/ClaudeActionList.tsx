import { Zap, Sparkles } from "lucide-react";
import type { ComponentType } from "react";

import IconBadge from "@/components/IconBadge";

export interface ClaudeAction {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  prompt: string;
}

export interface ClaudeActionListProps {
  actions: ClaudeAction[];
  onSelect: (id: string) => void;
  isLoading: boolean;
}

const ClaudeActionList: React.FC<ClaudeActionListProps> = ({
  actions,
  onSelect,
  isLoading,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onSelect(action.id)}
              disabled={isLoading}
              className="p-4 text-left border border-slate-700/50 rounded-xl hover:border-purple-500/50 hover:bg-slate-800/50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start space-x-3">
                <IconBadge
                  icon={Icon}
                  className="group-hover:bg-purple-600/20 transition-colors"
                  iconClassName="group-hover:text-purple-400"
                />
                <div className="flex-1">
                  <div className="font-medium text-white group-hover:text-purple-300 transition-colors">
                    {action.label}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {action.description}
                  </div>
                </div>
                <Zap className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClaudeActionList;
