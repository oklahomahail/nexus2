import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

import DemoBanner from "@/components/nav/DemoBanner";
import GlobalShortcuts from "@/components/nav/GlobalShortcuts";
import { LastLocationRedirector } from "@/components/nav/LastLocationRedirector";
import { Topbar } from "@/components/nav/Topbar";
import { analytics } from "@/utils/analytics";

export const AppLayout: React.FC = () => {
  const location = useLocation();

  const link = (to: string, label: string, testId?: string, end?: boolean) => (
    <NavLink
      to={to}
      end={end}
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
          {link("/", "Dashboard", "nav.dashboard.main", true)}
          {link("/clients", "Clients", "nav.clients")}
        </nav>
      </aside>
      <header className="bg-white border-b">
        <Topbar />
      </header>
      <main className="overflow-auto bg-white text-slate-900">
        <Outlet />
      </main>
      <LastLocationRedirector />
      <GlobalShortcuts />
      <DemoBanner />
    </div>
  );
};

export default AppLayout;
