// src/components/ConnectionStatus.tsx
import { Wifi, WifiOff, RotateCw, AlertCircle } from "lucide-react";
import React from "react";

import { useConnectionStatus } from "../hooks/useWebSocket";

interface ConnectionStatusProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = "",
  showText = false,
  size = "md",
}) => {
  const { status, isConnected, isConnecting, hasError, retry } =
    useConnectionStatus();

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const getStatusIcon = () => {
    if (isConnecting) {
      return <RotateCw className={`${sizeClasses[size]} animate-spin`} />;
    }

    if (hasError) {
      return <AlertCircle className={`${sizeClasses[size]} text-red-500`} />;
    }

    if (isConnected) {
      return <Wifi className={`${sizeClasses[size]} text-green-500`} />;
    }

    return <WifiOff className={`${sizeClasses[size]} text-gray-400`} />;
  };

  const getStatusText = () => {
    switch (status) {
      case "connecting":
        return "Connecting...";
      case "connected":
        return "Connected";
      case "error":
        return "Connection error";
      case "disconnected":
      default:
        return "Disconnected";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connecting":
        return "text-yellow-500";
      case "connected":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "disconnected":
      default:
        return "text-gray-400";
    }
  };

  const handleClick = () => {
    if (hasError || !isConnected) {
      retry();
    }
  };

  return (
    <div
      className={`flex items-center gap-2 ${className} ${
        hasError || !isConnected ? "cursor-pointer hover:opacity-70" : ""
      }`}
      onClick={handleClick}
      title={showText ? undefined : getStatusText()}
    >
      {getStatusIcon()}
      {showText && (
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

// Connection status banner for important disconnections
export const ConnectionBanner: React.FC = () => {
  const { status, retry } = useConnectionStatus();

  if (status === "connected" || status === "connecting") {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <WifiOff className="h-5 w-5 text-red-400 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-red-800">
              Connection Lost
            </h4>
            <p className="text-sm text-red-700">
              Real-time updates are temporarily unavailable.
            </p>
          </div>
        </div>
        <button
          onClick={retry}
          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;
