import React from "react";
import { Outlet, NavLink, useParams, useLocation } from "react-router-dom";

import { analytics } from "@/utils/analytics";

export const ClientLayout: React.FC = () => {
  const { clientId } = useParams();
  const location = useLocation();

  const link = (to: string, label: string, testId?: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "block px-4 py-2 rounded-md " +
        (isActive
          ? "bg-zinc-800 text-white"
          : "text-zinc-300 hover:bg-zinc-900 hover:text-white")
      }
      data-tutorial-step={testId}
      onClick={() => analytics.navigation(to, location.pathname)}
    >
      {label}
    </NavLink>
  );

  return (
    <div className="h-screen w-screen grid grid-cols-[260px_1fr] grid-rows-[56px_1fr]">
      <aside className="row-span-2 bg-zinc-950 text-zinc-100">
        {/* Logo Section */}
        <div className="p-4 border-b border-zinc-800">
          <NavLink to="/" className="flex items-center gap-2">
            <img
              src="/brand/nexus_logo_transparent.svg"
              alt="Nexus"
              className="h-8 w-auto"
            />
          </NavLink>
        </div>

        <nav className="p-3 space-y-2">
          <div className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-400">
            Navigation
          </div>
          {/* Global links */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              "block px-4 py-2 rounded-md " +
              (isActive
                ? "bg-zinc-800 text-white"
                : "text-zinc-300 hover:bg-zinc-900 hover:text-white")
            }
            data-tutorial-step="nav.dashboard.main"
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/clients"
            className={({ isActive }) =>
              "block px-4 py-2 rounded-md " +
              (isActive
                ? "bg-zinc-800 text-white"
                : "text-zinc-300 hover:bg-zinc-900 hover:text-white")
            }
            data-tutorial-step="nav.clients"
          >
            Clients
          </NavLink>

          {/* Client-specific links */}
          {clientId && (
            <>
              <div className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-400 mt-6">
                {clientId
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </div>
              {link(".", "Dashboard", "nav.dashboard")}
              {link("campaigns", "Campaigns", "nav.campaigns")}
              {link("segmentation", "Segmentation", "nav.segmentation")}
              {link("analytics", "Analytics", "nav.analytics")}
              {link("reports", "Reports", "nav.reports")}
              {link("data-quality", "Data Quality", "nav.data-quality")}
            </>
          )}
        </nav>
      </aside>
      <header className="bg-white border-b">
        {/* You can add a client-specific header here if needed */}
        <div className="h-14 flex items-center px-6">
          <h1 className="text-lg font-semibold text-slate-900">
            {clientId
              ? clientId
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())
              : "Client Dashboard"}
          </h1>
        </div>
      </header>
      <main className="overflow-auto bg-white text-slate-900">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
