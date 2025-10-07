import React from "react";
import { NavLink, useParams, useLocation } from "react-router-dom";
import { analytics } from "@/utils/analytics";

export const Sidebar: React.FC = () => {
  const { clientId } = useParams();
  const location = useLocation();

  const link = (to: string, label: string, testId?: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "block px-4 py-2 rounded-md " +
        (isActive ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-900 hover:text-white")
      }
      data-tutorial-step={testId}
      onClick={() => analytics.navigation(to, location.pathname)}
    >
      {label}
    </NavLink>
  );

  return (
    <nav className="p-3 space-y-2">
      <div className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-400">Navigation</div>
      {link("/clients", "Clients", "nav.clients")}
      {clientId && (
        <>
          {link(`/clients/${clientId}`, "Dashboard", "nav.dashboard")}
          {link(`/clients/${clientId}/campaigns`, "Campaigns", "nav.campaigns")}
          {link(`/clients/${clientId}/analytics`, "Analytics", "nav.analytics")}
          {link(`/clients/${clientId}/reports`, "Reports", "nav.reports")}
        </>
      )}
    </nav>
  );
};