import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { analytics } from "@/utils/analytics";

const DEMO_CLIENTS: { id: string; name: string }[] = [
  { id: "regional-food-bank", name: "Regional Food Bank" }
  // add real clients here
];

export const ClientSwitcher: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { clientId } = useParams();
  const navigate = useNavigate();

  const results = useMemo(
    () => DEMO_CLIENTS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const currentClient = clientId ? DEMO_CLIENTS.find(c => c.id === clientId) : null;

  return (
    <div className="relative" data-tutorial-step="clients.switcher">
      <button
        className="px-3 py-1.5 border rounded-md bg-white text-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="client-switcher-menu"
      >
        {currentClient?.name || "Select client"}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-72 border bg-white rounded-md shadow z-50 p-2"
          id="client-switcher-menu"
          role="dialog"
          aria-label="Select client"
        >
          <input
            className="w-full border rounded-md px-2 py-1 mb-2 text-sm"
            placeholder="Search clients"
            value={query}
            onChange={e => setQuery(e.target.value)}
            data-tutorial-step="clients.search"
            aria-label="Search clients"
            autoFocus
          />
          <ul className="max-h-64 overflow-auto" role="listbox" tabIndex={-1}>
            {results.map(c => (
              <li key={c.id} role="option" aria-selected={clientId === c.id}>
                <button
                  className="w-full text-left px-2 py-1 hover:bg-zinc-100 rounded text-sm"
                  onClick={() => {
                    localStorage.setItem("nexus:lastClientId", c.id);
                    analytics.clientSwitch(c.id);
                    navigate(`/clients/${c.id}`);
                    setIsOpen(false);
                  }}
                  data-tutorial-step={c.id === "regional-food-bank" ? "clients.table.row.regional-food-bank" : undefined}
                >
                  {c.name}
                </button>
              </li>
            ))}
            <li className="mt-2 border-t pt-2" role="option">
              <button
                className="w-full text-left px-2 py-1 hover:bg-zinc-100 rounded text-sm"
                onClick={() => {
                  navigate("/clients");
                  setIsOpen(false);
                }}
                data-tutorial-step="clients.add"
              >
                + New Client
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};