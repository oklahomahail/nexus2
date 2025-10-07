import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = { clientId: string };

const DEMO_CAMPAIGNS = [
  { id: "eoy-holiday-2025", name: "End-of-Year Holiday 2025", clientId: "regional-food-bank" }
];

export const CampaignSwitcher: React.FC<Props> = ({ clientId }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  
  const campaigns = useMemo(
    () => DEMO_CAMPAIGNS.filter(c => c.clientId === clientId && c.name.toLowerCase().includes(query.toLowerCase())),
    [clientId, query]
  );

  return (
    <div className="relative" data-tutorial-step="campaigns.switcher">
      <button 
        className="px-3 py-1.5 border rounded-md bg-white text-sm" 
        onClick={() => setOpen(v => !v)}
      >
        Campaigns
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 border bg-white rounded-md shadow z-50 p-2">
          <input
            className="w-full border rounded-md px-2 py-1 mb-2 text-sm"
            placeholder="Search campaigns"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <ul className="max-h-64 overflow-auto">
            {campaigns.map(c => (
              <li key={c.id}>
                <button
                  className="w-full text-left px-2 py-1 hover:bg-zinc-100 rounded text-sm"
                  onClick={() => {
                    navigate(`/clients/${clientId}/campaigns/${c.id}`);
                    setOpen(false);
                  }}
                  data-tutorial-step="campaigns.row"
                >
                  {c.name}
                </button>
              </li>
            ))}
            <li className="mt-2 border-t pt-2">
              <button
                className="w-full text-left px-2 py-1 hover:bg-zinc-100 rounded text-sm"
                onClick={() => {
                  navigate(`/clients/${clientId}/campaigns/new`);
                  setOpen(false);
                }}
                data-tutorial-step="campaigns.new"
              >
                + New Campaign
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};