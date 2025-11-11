// src/components/ClientSwitcher.tsx
import { Building, Search, Check } from "lucide-react";
import { useMemo, useState } from "react";

import { useClient } from "@/context/ClientContext";

interface Props {
  className?: string;
}

export default function ClientSwitcher({ className }: Props) {
  const { clients, currentClient, setCurrentClient } = useClient();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, query]);

  const handleSelect = (clientId: string) => {
    setCurrentClient(clientId);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Current client display / trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-left hover:bg-slate-700/50 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2 min-w-0">
          <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-white truncate">
            {currentClient?.name || "Select a client..."}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {currentClient && (
            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
          )}
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </div>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg z-50 max-h-80 flex flex-col">
            {/* Search input */}
            <div className="p-3 border-b border-slate-700/50">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Client list */}
            <div className="overflow-y-auto custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-sm">
                  {query ? "No clients found" : "No clients available"}
                </div>
              ) : (
                <div className="p-1">
                  {filtered.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => handleSelect(client.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-700/50 rounded transition-colors group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* TODO: Add brand property to Client type */}
                        {/* eslint-disable-next-line no-constant-condition */}
                        {false ? (
                          <img
                            src=""
                            alt=""
                            className="w-6 h-6 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">
                              {client.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">
                            {client.name}
                          </div>
                          <div className="text-slate-400 text-xs">
                            ID: {client.id}
                          </div>
                        </div>
                      </div>
                      {currentClient?.id === client.id && (
                        <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {clients.length > 0 && (
              <div className="p-2 border-t border-slate-700/50">
                <button
                  onClick={() => {
                    setCurrentClient(null);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors text-sm"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
