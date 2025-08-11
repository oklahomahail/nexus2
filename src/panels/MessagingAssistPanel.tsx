// src/panels/MessagingAssistPanel.tsx - Enhanced version with dark theme
import {
  Bot,
  Copy,
  RotateCcw,
  Zap,
  ArrowRight,
  Mail,
  Hash,
  Share2,
  MousePointer,
} from "lucide-react";
import React, { useState } from "react";

import { generateResponse } from "@/services/ai";

import LoadingSpinner from "../components/LoadingSpinner";

type MessageType = "Email" | "Subject Line" | "Social Post" | "CTA Button";

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  type: MessageType;
  isActive: boolean;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  title,
  description,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-full group text-left transition-all duration-200 ${
      isActive
        ? "bg-blue-600/20 border-blue-500/50"
        : "bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/40"
    } border rounded-xl p-4`}
  >
    <div className="flex items-start space-x-4">
      <div
        className={`p-2 rounded-lg transition-colors ${
          isActive
            ? "bg-blue-500/30 text-blue-400"
            : "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h3
          className={`font-semibold mb-1 transition-colors ${
            isActive ? "text-blue-300" : "text-white group-hover:text-blue-400"
          }`}
        >
          {title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
      <ArrowRight
        className={`w-5 h-5 text-slate-400 transition-all duration-200 ${
          isActive
            ? "opacity-100 translate-x-1"
            : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
        }`}
      />
    </div>
  </button>
);

const messageTypes = [
  {
    type: "Email" as MessageType,
    icon: <Mail className="w-5 h-5" />,
    title: "Fundraising Email",
    description:
      "Complete email campaigns with compelling storytelling and clear calls-to-action",
  },
  {
    type: "Subject Line" as MessageType,
    icon: <Hash className="w-5 h-5" />,
    title: "Email Subject Lines",
    description:
      "Attention-grabbing subject lines that improve open rates and engagement",
  },
  {
    type: "Social Post" as MessageType,
    icon: <Share2 className="w-5 h-5" />,
    title: "Social Media Post",
    description:
      "Engaging social content optimized for Facebook, Instagram, and Twitter",
  },
  {
    type: "CTA Button" as MessageType,
    icon: <MousePointer className="w-5 h-5" />,
    title: "Call-to-Action",
    description:
      "Powerful button text and CTAs that drive donations and engagement",
  },
];

export default function MessagingAssistantPanel(): React.ReactElement {
  const [messageType, setMessageType] = useState<MessageType>("Email");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerate = async () => {
    if (!context.trim()) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      // Create a proper prompt based on the message type and context
      const prompts: Record<MessageType, string> = {
        Email: `Write a compelling fundraising email with the following context: ${context}`,
        "Subject Line": `Create attention-grabbing email subject lines for this campaign: ${context}`,
        "Social Post": `Write engaging social media posts for this fundraising campaign: ${context}`,
        "CTA Button": `Create powerful call-to-action button text and CTAs for this campaign: ${context}`,
      };

      const response = await generateResponse(messageType, context, {
        prompt: prompts[messageType],
        context: { type: messageType, details: context },
      });

      if (response.success) {
        setResult(response.content);
      } else {
        setError(response.error || "Failed to generate content");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate content",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleReset = () => {
    setResult("");
    setError("");
    setContext("");
    setCopySuccess(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            AI Messaging Assistant
          </h1>
        </div>
        <p className="text-slate-400 text-lg">
          Generate compelling fundraising content powered by Claude AI
        </p>
      </div>

      {/* Content Type Selection */}
      <div>
        <h2 className="text-white text-xl font-semibold mb-6">
          Choose Content Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messageTypes.map(({ type, icon, title, description }) => (
            <QuickAction
              key={type}
              icon={icon}
              title={title}
              description={description}
              type={type}
              isActive={messageType === type}
              onClick={() => setMessageType(type)}
            />
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-3">
              Campaign Context & Details
            </label>
            <textarea
              rows={6}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder={`Describe your campaign details:\n\n• Campaign name and goal\n• Target audience\n• Key message or story\n• Deadline or urgency\n• Any specific requirements...`}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400">
              Selected:{" "}
              <span className="text-blue-400 font-medium">{messageType}</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !context.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>
                {loading ? "Generating..." : `Generate ${messageType}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <div>
              <h3 className="text-white font-medium mb-2">
                Claude is crafting your {messageType.toLowerCase()}...
              </h3>
              <p className="text-slate-400 text-sm">
                This may take up to 30 seconds
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="text-red-400 text-xl">⚠️</div>
            <div>
              <h3 className="text-red-300 font-medium mb-1">
                Generation Failed
              </h3>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-3 text-red-300 hover:text-red-200 text-sm underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl overflow-hidden">
          {/* Results Header */}
          <div className="px-6 py-4 border-b border-slate-700/30 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-white font-semibold">
                AI-Generated {messageType}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  copySuccess
                    ? "bg-green-500/20 text-green-300"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>{copySuccess ? "Copied!" : "Copy"}</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Request</span>
              </button>
            </div>
          </div>

          {/* Results Content */}
          <div className="p-6">
            <div className="bg-slate-900/50 rounded-lg p-6">
              <pre className="text-slate-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {result}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
