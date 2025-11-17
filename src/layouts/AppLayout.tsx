import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

import { ClientSwitcherModal } from "@/components/nav/client/ClientSwitcherModal";
import DemoBanner from "@/components/nav/DemoBanner";
import GlobalShortcuts from "@/components/nav/GlobalShortcuts";
import { LastLocationRedirector } from "@/components/nav/LastLocationRedirector";
import { Topbar } from "@/components/nav/Topbar";
import { useClient } from "@/context/ClientContext";

export const AppLayout: React.FC = () => {
  const { currentClient } = useClient();
  const [clientSwitcherOpen, setClientSwitcherOpen] = useState(false);

  return (
    <div className="h-screen w-screen grid grid-cols-[260px_1fr] grid-rows-[56px_1fr]">
      <aside className="row-span-2 bg-zinc-950 text-zinc-100 flex flex-col">
        {/* Logo Section */}
        <div className="flex justify-center px-6 pt-6 pb-4">
          <NavLink to="/" className="flex items-center">
            <img
              src="/brand/nexus_logo_transparent.svg"
              alt="Nexus"
              className="h-14 w-auto"
            />
          </NavLink>
        </div>

        {/* Client Switcher */}
        <div className="px-4 mb-4">
          <button
            onClick={() => setClientSwitcherOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2
                     bg-zinc-900 text-zinc-200 rounded-lg
                     hover:bg-zinc-800 transition-colors
                     border border-zinc-800 hover:border-zinc-700"
          >
            <span className="text-sm truncate">
              {currentClient?.name || "Select client"}
            </span>
            <ChevronDown size={16} className="flex-shrink-0 ml-2" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          <div className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-400">
            Navigation
          </div>
        </nav>

        {/* Footer spacer for future user profile/settings */}
        <div className="p-4 border-t border-zinc-800">
          {/* User profile component can go here */}
        </div>
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

      {/* Client Switcher Modal */}
      <ClientSwitcherModal
        isOpen={clientSwitcherOpen}
        onClose={() => setClientSwitcherOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
