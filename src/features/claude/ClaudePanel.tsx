// components/ClaudePanel.js - Enhanced version
import React, { useState, useCallback, useEffect } from 'react';
import { X, ArrowRight, Copy, RotateCcw, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useClaude } from '../hooks/useClaude';
import LoadingSpinner from './LoadingSpinner';

const ClaudePanel = React.memo(({ isOpen, onClose, currentCampaign }) => {
  const { askClaude, isLoading, response, error, conversationHistory, clearConversation, cancelRequest } = useClaude();
  const [selectedAction, setSelectedAction] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleClaudeRequest = useCallback(async (type) => {
    setSelectedAction(type);
    
    if (!currentCampaign) {
      await askClaude('Please select a campaign first to get specific assistance.');
      return;
    }

    await askClaude(null, currentCampaign, type);
  }, [askClaude, currentCampaign]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [response]);

  const handleNewRequest = useCallback(() => {
    clearConversation();
    setSelectedAction(null);
  }, [clearConversation]);

  // Enhanced Claude actions with better descriptions and estimated time
  const claudeActions = [
    { 
      id: 'subject', 
      label: 'Generate Subject Lines', 
      icon: '📧', 
      description: 'Get 3 compelling email subject lines with A/B testing tips',
      estimatedTime: '~30 seconds',
      priority: 'high'
    },
    { 
      id: 'email', 
      label: 'Draft Donor Email', 
      icon: '✉️', 
      description: 'Create a complete donor outreach email with proven structure',
      estimatedTime: '~45 seconds',
      priority: 'high'
    },
    { 
      id: 'strategy', 
      label: 'Campaign Strategy', 
      icon: '🎯', 
      description: 'Develop a week-by-week fundraising action plan',
      estimatedTime: '~60 seconds',
      priority: 'medium'
    },
    { 
      id: 'feedback', 
      label: 'Improve Campaign', 
      icon: '📈', 
      description: 'Get specific, actionable improvement suggestions',
      estimatedTime: '~45 seconds',
      priority: 'medium'
    },
    { 
      id: 'cta', 
      label: 'Suggest CTAs', 
      icon: '🔘', 
      description: 'Generate compelling call-to-action button text',
      estimatedTime: '~20 seconds',
      priority: 'low'
    },
  ];

  // Sort actions by priority and campaign relevance
  const sortedActions = claudeActions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Close panel on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <aside className="fixed right-0 top-0 h-full w-[480px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-xl z-50 border-l border-neutral-200 dark:border-neutral-700 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Claude Assistant</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        
        {/* Campaign Context */}
        {currentCampaign ? (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 space-y-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">{currentCampaign.name}</h3>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                currentCampaign.progress >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                currentCampaign.progress >= 50 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                currentCampaign.progress >= 25 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
              }`}>
                {currentCampaign.progress}% Complete
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Goal:</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-100 ml-2">
                  ${currentCampaign.goal?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Days Left:</span>
                <span className={`font-medium ml-2 ${
                  currentCampaign.daysLeft <= 7 ? 'text-rose-600 dark:text-rose-400' :
                  currentCampaign.daysLeft <= 30 ? 'text-amber-600 dark:text-amber-400' :
                  'text-neutral-800 dark:text-neutral-100'
                }`}>
                  {currentCampaign.daysLeft}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4 text-center">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Select a campaign to get personalized AI assistance
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Action Buttons */}
        {!response && !isLoading && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Choose an AI Assistant Action
              </h3>
              {currentCampaign && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ✨ Campaign-Optimized
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {sortedActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleClaudeRequest(action.id)}
                  disabled={isLoading}
                  className="w-full group"
                >
                  <div className="flex items-start space-x-4 p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-2xl transition-all duration-200 disabled:opacity-50 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700">
                    <span className="text-2xl mt-1 group-hover:scale-110 transition-transform duration-200">
                      {action.icon}
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {action.label}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-500">
                          {action.estimatedTime}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
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
                <h3 className="font-medium text-neutral-800 dark:text-neutral-100">
                  Claude is crafting your response...
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedAction && `Working on ${sortedActions.find(a => a.id === selectedAction)?.label}`}
                </p>
              </div>
              <button
                onClick={cancelRequest}
                className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                Cancel Request
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-6 space-y-3">
              <h3 className="font-medium text-rose-900 dark:text-rose-200">Something went wrong</h3>
              <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
              <button
                onClick={handleNewRequest}
                className="text-sm text-rose-600 dark:text-rose-400 hover:underline font-medium"
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
                <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">
                  Claude's Response
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    copySuccess 
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleNewRequest}
                  className="flex items-center space-x-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>New Request</span>
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-neutral-800 dark:text-neutral-200">
                {response}
              </pre>
            </div>

            {/* Conversation History Toggle */}
            {conversationHistory.length > 2 && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                  {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>View conversation history ({Math.floor(conversationHistory.length / 2)} exchanges)</span>
                </button>
                
                {showHistory && (
                  <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                    {conversationHistory.slice(0, -2).map((item, index) => (
                      <div key={index} className={`text-xs p-3 rounded-xl ${
                        item.role === 'user' 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                          : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}>
                        <div className="font-medium mb-1">
                          {item.role === 'user' ? 'You' : 'Claude'} • {item.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="whitespace-pre-wrap">{item.content.slice(0, 150)}...</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
});

export default ClaudePanel;