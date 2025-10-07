import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ClientSwitcher } from "./client/ClientSwitcher";
import { CampaignSwitcher } from "./client/CampaignSwitcher";

export const Topbar: React.FC = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const loc = useLocation();

  const crumbs = [];
  crumbs.push({ label: "Clients", to: "/clients" });
  if (clientId) crumbs.push({ label: "Client", to: `/clients/${clientId}` });
  if (loc.pathname.includes("/campaigns")) crumbs.push({ label: "Campaigns", to: `/clients/${clientId}/campaigns` });
  if (loc.pathname.includes("/analytics")) crumbs.push({ label: "Analytics", to: `/clients/${clientId}/analytics` });
  if (loc.pathname.includes("/reports")) crumbs.push({ label: "Reports", to: `/clients/${clientId}/reports` });

  return (
    <div className="h-full flex items-center gap-3 px-4">
      <nav className="flex items-center gap-2 text-sm" data-tutorial-step="top.breadcrumbs">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            <button className="text-zinc-600 hover:text-black" onClick={() => navigate(c.to)}>
              {c.label}
            </button>
            {i < crumbs.length - 1 ? <span className="text-zinc-400">/</span> : null}
          </span>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <ClientSwitcher />
        {clientId && <CampaignSwitcher clientId={clientId} />}
      </div>
    </div>
  );
};