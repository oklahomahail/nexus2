import { Search, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useClient } from "@/context/ClientContext";
import { getClientSlug } from "@/types/client";
import { analytics } from "@/utils/analytics";

interface ClientSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientSwitcherModal({
  isOpen,
  onClose,
}: ClientSwitcherModalProps) {
  const [query, setQuery] = useState("");
  const { clients, currentClient, setCurrentClient } = useClient();
  const navigate = useNavigate();

  const filteredClients = useMemo(() => {
    if (!query.trim()) return clients;
    const lowerQuery = query.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(lowerQuery));
  }, [clients, query]);

  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    const slug = getClientSlug(client);

    // Update context
    setCurrentClient(clientId);

    // Track analytics
    analytics.clientSwitch(clientId);

    // Navigate to client dashboard
    void navigate(`/clients/${slug}`);

    // Close modal
    onClose();
    setQuery("");
  };

  const handleNewClient = () => {
    void navigate("/clients?new=true");
    onClose();
    setQuery("");
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-xl bg-white dark:bg-neutral-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Switch Client
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search clients..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700
                       bg-white dark:bg-neutral-950 pl-10 pr-4 py-2 text-sm
                       text-neutral-900 dark:text-neutral-100
                       placeholder:text-neutral-500 dark:placeholder:text-neutral-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
              autoFocus
            />
          </div>
        </div>

        {/* Client Grid */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {filteredClients.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No clients found matching "{query}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredClients.map((client) => {
                const isActive = currentClient?.id === client.id;
                return (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client.id)}
                    className={`group relative flex flex-col items-center justify-center
                             rounded-lg border p-6 transition-all
                             ${
                               isActive
                                 ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500"
                                 : "border-neutral-200 dark:border-neutral-700 hover:border-blue-400 hover:shadow-md"
                             }`}
                  >
                    {/* Client Logo or Fallback */}
                    <div
                      className={`mb-3 flex h-14 w-14 items-center justify-center rounded-lg text-xl font-bold
                               ${
                                 isActive
                                   ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                                   : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                               }`}
                    >
                      {client.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Client Name */}
                    <span
                      className={`text-center text-sm font-medium
                               ${
                                 isActive
                                   ? "text-blue-700 dark:text-blue-300"
                                   : "text-neutral-700 dark:text-neutral-200 group-hover:text-blue-600"
                               }`}
                    >
                      {client.name}
                    </span>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute right-2 top-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <button
            onClick={handleNewClient}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700
                     bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-medium
                     text-neutral-700 dark:text-neutral-200
                     hover:bg-neutral-50 dark:hover:bg-neutral-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + New Client
          </button>
        </div>
      </div>
    </div>
  );
}
