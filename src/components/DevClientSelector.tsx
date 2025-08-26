// src/components/DevClientSelector.tsx
import { Settings, Wifi, WifiOff } from "lucide-react";
import React, { useState, useEffect } from "react";

import { useClient } from "../context/ClientContext";
import { useConnectionStatus } from "../hooks/useWebSocket";

interface DevClient {
  id: string;
  name: string;
  description: string;
}

const DEV_CLIENTS: DevClient[] = [
  {
    id: "dev-client-1",
    name: "Nexus Demo Org",
    description: "Primary development client for testing",
  },
  {
    id: "dev-client-2",
    name: "Test Foundation",
    description: "Secondary client for multi-tenant testing",
  },
  {
    id: "dev-client-3",
    name: "Local Nonprofit",
    description: "Third client for edge case testing",
  },
];

export const DevClientSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentClient, setCurrentClient } = useClient();
  const { isConnected } = useConnectionStatus();

  // Auto-select first client in development if none selected
  useEffect(() => {
    if (!currentClient && import.meta.env.DEV) {
      setCurrentClient(DEV_CLIENTS[0].id); // Just pass the ID string
    }
  }, [currentClient, setCurrentClient]);

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  const handleClientSelect = (client: DevClient) => {
    setCurrentClient(client.id); // Just pass the ID string
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-surface-elevated border border-border rounded-lg shadow-lg backdrop-blur-md">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-muted rounded-lg transition-colors"
          title="Development Client Selector"
        >
          <Settings className="w-4 h-4" />
          <span>Dev Client</span>
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-80 bg-surface-elevated border border-border rounded-lg shadow-lg backdrop-blur-md">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">
                  Development Clients
                </h3>
                <div className="flex items-center gap-1 text-xs">
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3 text-green-500" />
                      <span className="text-green-500">Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-red-500" />
                      <span className="text-red-500">Disconnected</span>
                    </>
                  )}
                </div>
              </div>

              {/* Current Client Display */}
              {currentClient && (
                <div className="mb-3 p-3 bg-surface-muted rounded-lg">
                  <div className="text-xs text-text-muted mb-1">
                    Current Client:
                  </div>
                  <div className="text-sm font-medium text-text-primary">
                    {typeof currentClient === "string"
                      ? DEV_CLIENTS.find((c) => c.id === currentClient)?.name ||
                        currentClient
                      : currentClient.name}
                  </div>
                  <div className="text-xs text-text-secondary">
                    ID:{" "}
                    {typeof currentClient === "string"
                      ? currentClient
                      : currentClient.id}
                  </div>
                </div>
              )}

              {/* Client Options */}
              <div className="space-y-1">
                {DEV_CLIENTS.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      (typeof currentClient === "string"
                        ? currentClient
                        : currentClient?.id) === client.id
                        ? "bg-brand-primary text-text-inverse"
                        : "hover:bg-surface-muted text-text-primary"
                    }`}
                  >
                    <div className="font-medium text-sm">{client.name}</div>
                    <div className="text-xs opacity-75">
                      {client.description}
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      ID: {client.id}
                    </div>
                  </button>
                ))}
              </div>

              {/* WebSocket Test Commands */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="text-xs text-text-muted mb-2">
                  Test Commands:
                </div>
                <div className="text-xs text-text-secondary space-y-1 font-mono bg-surface rounded p-2">
                  <div>
                    mockServer.simulateCampaignUpdate("campaign_1", "raised",
                    5000)
                  </div>
                  <div>
                    mockServer.simulateMilestone("campaign_1", "goal_reached",
                    75)
                  </div>
                  <div>mockServer.startCampaignSimulation("campaign_1")</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevClientSelector;
