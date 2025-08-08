import React, { useState, useCallback, useEffect } from 'react';
import { 
  X, ArrowRight, Copy, RotateCcw, Zap, ChevronDown, ChevronUp, 
  MessageSquare, Trash2, Plus, User as CampaignIcon
} from 'lucide-react';

// Fixed import paths based on file structure:
// From src/features/claude/ClaudePanel.tsx, the paths should be:

// Same directory (no ../ needed)
import { generateClaudeResponse, ClaudeMessage } from './claudeService';

// Go up two levels to reach src/models/ and src/components/
import { Campaign } from '../../models/campaign';
import LoadingSpinner from '../../components/LoadingSpinner';

// Rest of your ClaudePanel code...
interface ClaudePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentCampaign?: Campaign | null;
  onCampaignSelect?: (campaign: Campaign) => void;
}

// Define types locally if they're not exported from useClaude
interface ConversationSession {
  id: string;
  campaignId?: string;
  campaignName?: string;
  messages: ClaudeMessage[];
  createdAt: string;
  lastUpdated: string;
}

interface ClaudeAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
}

interface ClaudePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentCampaign?: Campaign | null;
  onCampaignSelect?: (campaign: Campaign) => void;
}

const ClaudePanel: React.FC<ClaudePanelProps> = ({ 
  isOpen, 
  onClose, 
  currentCampaign,
  onCampaignSelect 
}) => {
  // If useClaude hook doesn't work, create local state for testing
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ClaudeMessage[]>([]);
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);
  
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleClaudeRequest = useCallback(async (type: string) => {
    if (!currentCampaign) {
      setError('Please select a campaign first');
      return;
    }
    
    setSelectedAction(type);
    setIsLoading(true);
    setError(null);

    try {
      // Mock response for testing - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      const mockResponse = `Mock ${type} response for campaign: ${currentCampaign.name}\n\nThis is a test response. Replace with real Claude API integration.`;
      setResponse(mockResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  }, [currentCampaign]);

  const handleCopy = useCallback(async () => {
    if (!response) return;
    
    try {
      await navigator.clipboard.writeText(response);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [response]);

  const handleNewRequest = useCallback(() => {
    setResponse(null);
    setError(null);
    setSelectedAction(null);
    setShowCustomInput(false);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Enhanced Claude actions with better descriptions
  const claudeActions: ClaudeAction[] = [
    { 
      id: 'subject', 
      label: 'Generate Subject Lines', 
      icon: '📧', 
      description: 'Create 5 compelling email subject lines with A/B testing recommendations',
      estimatedTime: '~30 seconds',
      priority: 'high'
    },
    { 
      id: 'email', 
      label: 'Draft Donor Email', 
      icon: '✉️', 
      description: 'Write a complete fundraising email with proven structure and personalization',
      estimatedTime: '~45 seconds',
      priority: 'high'
    },
    { 
      id: 'strategy', 
      label: 'Campaign Strategy', 
      icon: '🎯', 
      description: 'Develop a comprehensive week-by-week action plan with specific tactics',
      estimatedTime: '~60 seconds',
      priority: 'medium'
    },
    { 
      id: 'feedback', 
      label: 'Improve Campaign', 
      icon: '📈', 
      description: 'Get actionable suggestions to optimize performance and engagement',
      estimatedTime: '~45 seconds',
      priority: 'medium'
    },
    { 
      id: 'cta', 
      label: 'CTA Buttons', 
      icon: '🔘', 
      description: 'Generate compelling call-to-action button text variations',
      estimatedTime: '~20 seconds',
      priority: 'low'
    },
  ];

  // Close panel on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <aside className="fixed right-0 top-0 h-full w-[500px] bg-slate-900/95 backdrop-blur-md shadow-xl z-50 border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Claude AI Assistant</h2>
              <p className="text-slate-400 text-sm">Campaign-powered content generation</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        {/* Campaign Context */}
        {currentCampaign ? (
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-800/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white truncate">{currentCampaign.name}</h3>
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                currentCampaign.progress || 0 || 0 >= 75 ? 'bg-green-500/20 text-green-400' :
                currentCampaign.progress || 0 || 0 >= 50 ? 'bg-blue-500/20 text-blue-400' :
                currentCampaign.progress || 0 || 0 >= 25 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {currentCampaign.progress || 0 || 0}% Complete
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-400">Goal:</span>
                <span className="text-white ml-2 font-medium">
                  ${currentCampaign.goal?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Days Left:</span>
                <span className={`ml-2 font-medium ${
                  currentCampaign.daysLeft || 0 || 0 <= 7 ? 'text-red-400' :
                  currentCampaign.daysLeft || 0 || 0 <= 30 ? 'text-yellow-400' :
                  'text-white'
                }`}>
                  {currentCampaign.daysLeft || 0 || 0}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
            <CampaignIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm mb-3">
              Select a campaign to get AI assistance tailored to your specific goals and context.
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Action Buttons */}
        {!response && !isLoading && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Choose an AI Action</h3>
              {currentCampaign && (
                <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-500/20 rounded-lg">
                  ✨ Campaign-Optimized
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {claudeActions.map((action: ClaudeAction) => (
                <button
                  key={action.id}
                  onClick={() => handleClaudeRequest(action.id)}
                  disabled={isLoading || !currentCampaign}
                  className="w-full group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start space-x-4 p-4 text-left hover:bg-slate-800/50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-700">
                    <span className="text-2xl mt-1 group-hover:scale-110 transition-transform duration-200">
                      {action.icon}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {action.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          {action.estimatedTime}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="p-6">
            <div className="text-center py-12 space-y-4">
              <LoadingSpinner size="lg" />
              <div className="space-y-2">
                <h3 className="font-medium text-white">
                  Claude is analyzing your campaign...
                </h3>
                <p className="text-sm text-slate-400">
                  {selectedAction && `Working on ${claudeActions.find(a => a.id === selectedAction)?.label}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6 space-y-3">
              <h3 className="font-medium text-red-300">Request Failed</h3>
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={handleNewRequest}
                className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-white">Claude's Response</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    copySuccess 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleNewRequest}
                  className="flex items-center space-x-2 px-3 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg text-sm font-medium transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>New Request</span>
                </button>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-slate-200">
                {response}
              </pre>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ClaudePanel;
